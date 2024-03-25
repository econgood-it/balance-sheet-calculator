import { makeCompanyFacts } from '../../src/models/company.facts';
import { makeBalanceSheet } from '../../src/models/balance.sheet';
import { makeRatingFactory } from '../../src/factories/rating.factory';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';

describe('BalanceSheet', () => {
  it('is created with default values', () => {
    const balanceSheet = makeBalanceSheet();
    expect(balanceSheet).toMatchObject({
      version: BalanceSheetVersion.v5_0_8,
      type: BalanceSheetType.Full,
      companyFacts: makeCompanyFacts(),
      ratings: makeRatingFactory().createDefaultRatings(
        BalanceSheetType.Full,
        BalanceSheetVersion.v5_0_8
      ),
      stakeholderWeights: [],
    });
  });
});
