import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { CompanyFacts, makeCompanyFacts } from './company.facts';
import { makeRating, makeRatingsQuery, Rating, RatingsQuery } from './rating';
import { makeWeighting, Weighting } from './weighting';
import deepFreeze from 'deep-freeze';
import { makeRatingFactory } from '../factories/rating.factory';
import { Organization } from './organization';
import { LookupError } from '../exceptions/lookup.error';
import { RegionProvider } from '../providers/region.provider';
import { IndustryProvider } from '../providers/industry.provider';
import { calculate } from '../calculations/calculator';
import { makeStakeholderWeightCalculator } from '../calculations/stakeholder.weight.calculator';
import { makeTopicWeightCalculator } from '../calculations/topic.weight.calculator';
import { WeightingProvider } from '../providers/weightingProvider';
import {
  BalanceSheetCreateRequestBodySchema,
  BalanceSheetPatchRequestBodySchema,
  BalanceSheetResponseBodySchema,
} from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import { z } from 'zod';
import { Translations } from '../language/translations';
import { MatrixBodySchema } from '@ecogood/e-calculator-schemas/dist/matrix.dto';
import { eq } from '@mr42/version-comparator/dist/version.comparator';
import { ValueError } from '../exceptions/value.error';
import { gte } from 'lodash';

export const BalanceSheetVersionSchema = z.nativeEnum(BalanceSheetVersion);

type BalanceSheetOpts = {
  id?: number;
  type: BalanceSheetType;
  version: BalanceSheetVersion;
  companyFacts: CompanyFacts;
  ratings: readonly Rating[];
  stakeholderWeights: readonly Weighting[];
  organizationId?: number;
};
//
export type BalanceSheet = BalanceSheetOpts & {
  merge: (
    requestBody: z.infer<typeof BalanceSheetPatchRequestBodySchema>
  ) => BalanceSheet;
  getRating: (shortName: string) => Rating;
  getTopics: () => Rating[];
  getAspects: (shortNameTopic?: string) => Rating[];
  assignOrganization: (organization: Organization) => BalanceSheet;
  totalPoints: () => number;
  getPositiveAspects: (shortNameTopic?: string) => Rating[];
  getNegativeAspects: (shortNameTopic?: string) => Rating[];
  getTopicOfAspect: (shortNameAspect: string) => Rating;
  reCalculate: () => Promise<BalanceSheet>;
  asMatrixRepresentation: (
    language: keyof Translations
  ) => z.infer<typeof MatrixBodySchema>;
  toJson: (
    language: keyof Translations
  ) => z.infer<typeof BalanceSheetResponseBodySchema>;
};

export function makeBalanceSheet(opts?: BalanceSheetOpts): BalanceSheet {
  const data = opts || {
    id: undefined,
    type: BalanceSheetType.Full,
    version: BalanceSheetVersion.v5_0_8,
    companyFacts: makeCompanyFacts(),
    ratings: makeRatingFactory().createDefaultRatings(
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_8
    ),
    stakeholderWeights: [],
    organizationId: undefined,
  };

  function validatedData() {
    if (eq(data.version, BalanceSheetVersion.v5_1_0)) {
      if (getRating('B1.1').weight !== 0 && getRating('B1.2').weight !== 0) {
        throw new ValueError(
          'At least one of B1.1 and B1.2 must have weight 0'
        );
      }
    }
    return data;
  }

  function getRating(shortName: string): Rating {
    return makeRatingsQuery(data.ratings).getRating(shortName);
  }

  function getTopics(): Rating[] {
    return data.ratings.filter((rating) => rating.isTopic());
  }

  function getPositiveAspects(shortNameTopic?: string): Rating[] {
    const positiveAspects = data.ratings.filter(
      (rating) => rating.isAspect() && rating.isPositive
    );
    return shortNameTopic
      ? positiveAspects.filter((rating) =>
          rating.isAspectOfTopic(shortNameTopic)
        )
      : positiveAspects;
  }

  function getNegativeAspects(shortNameTopic?: string): Rating[] {
    const negativeAspects = data.ratings.filter(
      (rating) => rating.isAspect() && !rating.isPositive
    );
    return shortNameTopic
      ? negativeAspects.filter((rating) =>
          rating.isAspectOfTopic(shortNameTopic)
        )
      : negativeAspects;
  }

  function getAspects(shortNameTopic?: string): Rating[] {
    return makeRatingsQuery(data.ratings).getAspects(shortNameTopic);
  }

  function getTopicOfAspect(shortNameAspect: string) {
    const topic = data.ratings.find(
      (r) => r.shortName === shortNameAspect.substring(0, 2)
    );
    if (!topic) {
      throw new LookupError(`Topic for aspect ${shortNameAspect} not found.`);
    }
    return topic;
  }

  function assignOrganization(organization: Organization): BalanceSheet {
    return makeBalanceSheet({ ...data, organizationId: organization.id });
  }

  function replaceRatings(ratings: Rating[]): BalanceSheet {
    const newRatings = data.ratings.map((rating) => {
      const newRating = ratings.find(
        (newRating) => newRating.shortName === rating.shortName
      );
      return newRating || rating;
    });
    return makeBalanceSheet({ ...data, ratings: newRatings });
  }

  function updatePositiveAspects(
    topicMaxPoints: number,
    positiveAspects: Rating[]
  ): Rating[] {
    const sumOfAspectWeights = positiveAspects.reduce(
      (acc, curr) => acc + curr.weight,
      0
    );
    return positiveAspects.map((a) => {
      const maxPoints =
        sumOfAspectWeights > 0
          ? (topicMaxPoints * a.weight) / sumOfAspectWeights
          : 0;
      return {
        ...a,
        maxPoints,
        points: (maxPoints * a.estimations) / 10.0,
      };
    });
  }

  function updateNegativeAspects(
    topicMaxPoints: number,
    negativeAspects: Rating[]
  ) {
    return negativeAspects.map((a) => ({
      ...a,
      points: (a.estimations * topicMaxPoints) / 50,
      maxPoints: (-200 * topicMaxPoints) / 50,
    }));
  }

  function adjustTopicWeights(
    topicWeights: WeightingProvider,
    stakeholderWeights: WeightingProvider
  ): BalanceSheet {
    const topics = getTopics();
    const topicsWithUpdatedWeight = topics.map((t) =>
      // Topic wheigt is set to 1 if data of company facts is empty.
      // See Weighting G69
      makeRating({
        ...t,
        weight: t.isWeightSelectedByUser
          ? t.weight
          : topicWeights.getOrFail(t.shortName).weight,
      })
    );
    const sumOfTopicWeights = topicsWithUpdatedWeight.reduce(
      (acc, curr) =>
        acc +
        stakeholderWeights.getOrFail(curr.getStakeholderName()).weight *
          curr.weight,
      0
    );
    const topicsWithUpdatedMaxPoints = topicsWithUpdatedWeight.map((t) => {
      const stakeholderWeight = stakeholderWeights.getOrFail(
        t.getStakeholderName()
      ).weight;
      return makeRating({
        ...t,
        maxPoints: ((stakeholderWeight * t.weight) / sumOfTopicWeights) * 1000,
      });
    });

    const updatedRatings = topicsWithUpdatedMaxPoints
      .map((t) => {
        const positiveAspects = updatePositiveAspects(
          t.maxPoints,
          getPositiveAspects(t.shortName)
        );
        const negativeAspects = updateNegativeAspects(
          t.maxPoints,
          getNegativeAspects(t.shortName)
        );
        const aspects = [...positiveAspects, ...negativeAspects];
        const topicPoints = aspects.reduce(
          (sum, current) => sum + current.points,
          0
        );
        const topicEstimations =
          t.maxPoints > 0 ? topicPoints / t.maxPoints : 0;
        const topic = makeRating({
          ...t,
          points: topicPoints,
          estimations: topicEstimations,
        });
        return [topic, ...positiveAspects, ...negativeAspects];
      })
      .flat();

    return replaceRatings(updatedRatings);
  }

  async function reCalculate(): Promise<BalanceSheet> {
    // TODO: Replace providers with crockford objects
    const regionProvider = await RegionProvider.fromVersion(data.version);
    const industryProvider = await IndustryProvider.fromVersion(data.version);
    const calcResults = await calculate(
      regionProvider,
      industryProvider,
      data.version,
      data.companyFacts
    );
    const stakeholderWeightCalculator =
      makeStakeholderWeightCalculator(calcResults);
    const topicWeightCalculator = makeTopicWeightCalculator(
      calcResults,
      data.companyFacts
    );
    const stakeholderWeights = (
      await stakeholderWeightCalculator.calculate()
    ).merge(data.stakeholderWeights);
    const topicWeights = topicWeightCalculator.calculate();
    return adjustTopicWeights(topicWeights, stakeholderWeights);
  }

  const MAX_NEGATIVE_POINTS = -3600;

  function totalPoints(): number {
    const sum = data.ratings
      .filter((r) => r.isTopic())
      .reduce((sumAcc, currentRating) => sumAcc + currentRating.points, 0);
    return sum < MAX_NEGATIVE_POINTS ? MAX_NEGATIVE_POINTS : sum;
  }

  function defaultWeight(
    shortName: string,
    requestBody: z.infer<typeof BalanceSheetPatchRequestBodySchema>,
    defaultRatingsQuery: RatingsQuery
  ) {
    if (gte(data.version, BalanceSheetVersion.v5_1_0) && shortName === 'B1.2') {
      const b11Rating = requestBody.ratings.find(
        (newRating) => newRating.shortName === 'B1.1'
      );
      if (b11Rating?.weight === 0) {
        return defaultRatingsQuery.getRating('B1.1').weight;
      }
    }
    return defaultRatingsQuery.getRating(shortName).weight;
  }

  function merge(
    requestBody: z.infer<typeof BalanceSheetPatchRequestBodySchema>
  ): BalanceSheet {
    const defaultRatings = makeRatingsQuery(
      makeRatingFactory().createDefaultRatings(data.type, data.version)
    );
    return makeBalanceSheet({
      ...data,
      companyFacts: requestBody.companyFacts
        ? data.companyFacts.merge(requestBody.companyFacts)
        : data.companyFacts,
      ratings: data.ratings.map((rating) => {
        const newRating = requestBody.ratings.find(
          (newRating) => newRating.shortName === rating.shortName
        );

        return newRating
          ? rating.merge(
              newRating,
              defaultWeight(rating.shortName, requestBody, defaultRatings)
            )
          : rating;
      }),
      stakeholderWeights:
        requestBody.stakeholderWeights?.map((sw) => makeWeighting(sw)) ||
        data.stakeholderWeights,
    });
  }

  function asMatrixRepresentation(language: keyof Translations) {
    return MatrixBodySchema.parse({
      ratings: getTopics().map((r) => r.toMatrixFormat(language)),
      totalPoints: totalPoints(),
    });
  }

  function toJson(language: keyof Translations) {
    return BalanceSheetResponseBodySchema.parse({
      id: data.id,
      type: data.type,
      version: data.version,
      companyFacts: data.companyFacts.toJson(),
      ratings: data.ratings.map((r) => r.toJson(language)),
      stakeholderWeights: data.stakeholderWeights,
      organizationId: data.organizationId,
    });
  }

  return deepFreeze({
    ...validatedData(),
    toJson,
    asMatrixRepresentation,
    merge,
    getTopics,
    getAspects,
    assignOrganization,
    getRating,
    totalPoints,
    getPositiveAspects,
    getNegativeAspects,
    getTopicOfAspect,
    reCalculate,
  });
}

makeBalanceSheet.fromJson = function fromJson(
  json: z.input<typeof BalanceSheetCreateRequestBodySchema>
): BalanceSheet {
  const balanceSheet = BalanceSheetCreateRequestBodySchema.parse(json);
  const version = balanceSheet.version;
  const type = balanceSheet.type;
  const companyFacts = makeCompanyFacts.fromJson(balanceSheet.companyFacts);
  const ratings = makeRatingFactory().createDefaultRatings(type, version);
  return makeBalanceSheet({
    version,
    type,
    companyFacts,
    ratings,
    stakeholderWeights: balanceSheet.stakeholderWeights,
  }).merge({ ratings: balanceSheet.ratings });
};
