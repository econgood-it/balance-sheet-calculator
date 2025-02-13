import { makeBalanceSheet } from '../../src/models/balance.sheet';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { makeCompanyFacts } from '../../src/models/company.facts';

describe('Audit', () => {
  it('should be created', () => {
    const balanceSheet = makeBalanceSheet({
      id: 9,
      version: BalanceSheetVersion.v5_0_8,
      type: BalanceSheetType.Full,
      companyFacts: makeCompanyFacts(),
      ratings: [],
      stakeholderWeights: [],
    });
    const audit = makeAudit();
    audit.submitBalanceSheet(balanceSheet);
    expect(audit.submittedBalanceSheetId).toEqual(balanceSheet.id);
  });
});
