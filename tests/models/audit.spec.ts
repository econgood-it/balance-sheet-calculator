import { makeBalanceSheet } from '../../src/models/balance.sheet';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { makeCompanyFacts } from '../../src/models/company.facts';
import { makeAudit } from '../../src/models/audit';
import { makeCertificationAuthority } from '../../src/models/certification.authoriy';
import { CertificationAuthorityNames } from '@ecogood/e-calculator-schemas/dist/audit.dto';
import { generalInformationDummy } from './general.information.dummy';

describe('Audit', () => {
  it('should be created', () => {
    const balanceSheet = makeBalanceSheet({
      id: 9,
      version: BalanceSheetVersion.v5_0_8,
      type: BalanceSheetType.Full,
      companyFacts: makeCompanyFacts(),
      ratings: [],
      stakeholderWeights: [],
      generalInformation: generalInformationDummy,
    });
    const ecgAudit = makeCertificationAuthority({
      name: CertificationAuthorityNames.AUDIT,
      organizationId: 9,
    });
    const audit = makeAudit().submitBalanceSheet(balanceSheet, ecgAudit);
    expect(audit.id).toBeUndefined();
    expect(audit.submittedBalanceSheetId).toEqual(balanceSheet.id);
    expect(audit.balanceSheetToCopy).toEqual({
      ...balanceSheet,
      id: undefined,
      organizationId: ecgAudit.organizationId,
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
      generalInformation: generalInformationDummy,
    });
    const originalCopy = makeBalanceSheet({
      id: 10,
      version: BalanceSheetVersion.v5_0_8,
      type: BalanceSheetType.Full,
      companyFacts: makeCompanyFacts(),
      ratings: [],
      stakeholderWeights: [],
      generalInformation: generalInformationDummy,
    });
    const auditCopy = makeBalanceSheet({
      id: 11,
      version: BalanceSheetVersion.v5_0_8,
      type: BalanceSheetType.Full,
      companyFacts: makeCompanyFacts(),
      ratings: [],
      stakeholderWeights: [],
      generalInformation: generalInformationDummy,
    });

    const ecgAudit = makeCertificationAuthority({
      name: CertificationAuthorityNames.AUDIT,
      organizationId: 9,
    });
    const audit = makeAudit()
      .submitBalanceSheet(balanceSheet, ecgAudit)
      .assignAuditCopies(originalCopy, auditCopy);
    expect(audit.balanceSheetToCopy).toBeUndefined();
    expect(audit.originalCopyId).toEqual(originalCopy.id);
    expect(audit.auditCopyId).toEqual(auditCopy.id);
  });
});
