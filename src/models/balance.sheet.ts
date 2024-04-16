import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { CompanyFacts, makeCompanyFacts } from './company.facts';
import { makeRating, Rating } from './rating';
import { StakeholderWeight } from './stakeholder.weight';
import deepFreeze from 'deep-freeze';
import { makeRatingFactory } from '../factories/rating.factory';
import { Organization } from './organization';
import { LookupError } from '../exceptions/lookup.error';
import { isTopic } from './oldRating';
import { ValueError } from '../exceptions/value.error';

type BalanceSheetOpts = {
  id: number | undefined;
  type: BalanceSheetType;
  version: BalanceSheetVersion;
  companyFacts: CompanyFacts;
  ratings: readonly Rating[];
  stakeholderWeights: readonly StakeholderWeight[];
  organizationId: number | undefined;
};
//
export type BalanceSheet = BalanceSheetOpts & {
  getRating: (shortName: string) => Rating;
  getTopics: () => Rating[];
  getAspectsOfTopic: (shortNameTopic: string) => Rating[];
  assignOrganization: (organization: Organization) => BalanceSheet;
  submitEstimations: (
    submissions: { shortName: string; estimations: number }[]
  ) => BalanceSheet;
  totalPoints: () => number;
  getPositiveAspects: () => Rating[];
  getNegativeAspects: () => Rating[];
  getTopicOfAspect: (shortNameAspect: string) => Rating;
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

  function getRating(shortName: string): Rating {
    const rating = data.ratings.find(
      (rating) => rating.shortName === shortName
    );
    if (!rating) {
      throw new LookupError(`Rating with shortName ${shortName} not found`);
    }
    return rating;
  }

  function getTopics(): Rating[] {
    return data.ratings.filter((rating) => rating.isTopic());
  }

  function getPositiveAspects(): Rating[] {
    return data.ratings.filter(
      (rating) => rating.isAspect() && rating.isPositive
    );
  }

  function getNegativeAspects(): Rating[] {
    return data.ratings.filter(
      (rating) => rating.isAspect() && !rating.isPositive
    );
  }

  function getAspectsOfTopic(shortNameTopic: string): Rating[] {
    return data.ratings.filter((rating) =>
      rating.isAspectOfTopic(shortNameTopic)
    );
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

  function submitEstimations(
    submissions: { shortName: string; estimations: number }[]
  ): BalanceSheet {
    // Update aspects
    const newAspects = submissions.map(({ shortName, estimations }) => {
      const rating = getRating(shortName);
      if (rating.isTopic()) {
        throw new ValueError('You cannot submit estimations for a topic');
      }
      return rating.isPositive
        ? rating.submitPositiveEstimations(estimations)
        : rating.submitNegativeEstimations(
            estimations,
            getTopicOfAspect(shortName).maxPoints
          );
    });
    const newRatings = replaceRatings(newAspects);
    // Update topics
    const topics = newRatings.getTopics().map((topic) => {
      const aspects = newRatings.getAspectsOfTopic(topic.shortName);
      const points = aspects.reduce(
        (sumAcc, currentRating) => sumAcc + currentRating.points,
        0
      );
      const estimations = topic.maxPoints > 0 ? points / topic.maxPoints : 0;

      return makeRating({ ...topic, points, estimations });
    });
    return replaceRatings([...topics, ...newAspects]);
  }

  const MAX_NEGATIVE_POINTS = -3600;

  function totalPoints(): number {
    const sum = data.ratings
      .filter((r) => isTopic(r))
      .reduce((sumAcc, currentRating) => sumAcc + currentRating.points, 0);
    return sum < MAX_NEGATIVE_POINTS ? MAX_NEGATIVE_POINTS : sum;
  }

  return deepFreeze({
    ...data,
    getTopics,
    getAspectsOfTopic,
    assignOrganization,
    getRating,
    submitEstimations,
    totalPoints,
    getPositiveAspects,
    getNegativeAspects,
    getTopicOfAspect,
  });
}
