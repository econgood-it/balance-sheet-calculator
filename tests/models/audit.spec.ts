import { makeBalanceSheet } from '../../src/models/balance.sheet';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { makeCompanyFacts } from '../../src/models/company.facts';
import { makeAudit } from '../../src/models/audit';

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
    const ecgAuditAdminId = 9;
    const audit = makeAudit().submitBalanceSheet(balanceSheet, ecgAuditAdminId);
    expect(audit.id).toBeUndefined();
    expect(audit.submittedBalanceSheetId).toEqual(balanceSheet.id);
    expect(audit.balanceSheetToCopy).toEqual({
      ...balanceSheet,
      id: undefined,
      organizationId: ecgAuditAdminId,
    });
  });

  it('should assign copies', () => {
    const balanceSheet = makeBalanceSheet({
      id: 9,
      version: BalanceSheetVersion.v5_0_8,
      type: BalanceSheetType.Full,
      companyFacts: makeCompanyFacts(),
      ratings: [],
      stakeholderWeights: [],
    });
    const originalCopy = makeBalanceSheet({
      id: 10,
      version: BalanceSheetVersion.v5_0_8,
      type: BalanceSheetType.Full,
      companyFacts: makeCompanyFacts(),
      ratings: [],
      stakeholderWeights: [],
    });
    const auditCopy = makeBalanceSheet({
      id: 11,
      version: BalanceSheetVersion.v5_0_8,
      type: BalanceSheetType.Full,
      companyFacts: makeCompanyFacts(),
      ratings: [],
      stakeholderWeights: [],
    });
    const ecgAuditAdminId = 9;
    const audit = makeAudit()
      .submitBalanceSheet(balanceSheet, ecgAuditAdminId)
      .assignAuditCopies(originalCopy, auditCopy);
    expect(audit.balanceSheetToCopy).toBeUndefined();
    expect(audit.originalCopyId).toEqual(originalCopy.id);
    expect(audit.auditCopyId).toEqual(auditCopy.id);
  });
});
