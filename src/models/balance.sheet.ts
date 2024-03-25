import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { CompanyFacts, makeCompanyFacts } from './company.facts';
import { Rating } from './rating';
import { StakeholderWeight } from './stakeholder.weight';
import deepFreeze from 'deep-freeze';
import { makeRatingFactory } from '../factories/rating.factory';

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
export type BalanceSheet = BalanceSheetOpts;

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

  return deepFreeze({
    ...data,
  });
}
