import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { CompanyFacts, makeCompanyFacts } from './company.facts';
import { Rating } from './rating';
import { StakeholderWeight } from './stakeholder.weight';
import deepFreeze from 'deep-freeze';
import { makeRatingFactory } from '../factories/rating.factory';
import { Organization } from './organization';
import { LookupError } from '../exceptions/lookup.error';

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

  function getAspectsOfTopic(shortNameTopic: string): Rating[] {
    return data.ratings.filter((rating) =>
      rating.isAspectOfTopic(shortNameTopic)
    );
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
    const newRatings = submissions.map(({ shortName, estimations }) => {
      const rating = getRating(shortName);
      return rating.submitEstimations(estimations);
    });

    return replaceRatings(newRatings);
  }

  return deepFreeze({
    ...data,
    getTopics,
    getAspectsOfTopic,
    assignOrganization,
    getRating,
    submitEstimations,
  });
}
