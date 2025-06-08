import { BalanceSheet, makeBalanceSheet } from './balance.sheet';
import deepFreeze from 'deep-freeze';
import { CertificationAuthorityNames } from '@ecogood/e-calculator-schemas/dist/audit.dto';
import { CertificationAuthority } from './certification.authoriy';

type AuditProps = {
  id?: number;
  submittedBalanceSheetId?: number;
  originalCopyId?: number;
  auditCopyId?: number;
  balanceSheetToCopy?: BalanceSheet;
  submittedAt?: Date;
  certificationAuthorityName?: CertificationAuthorityNames;
};

export type Audit = AuditProps & {
  submitBalanceSheet: (
    balanceSheet: BalanceSheet,
    certificationAuthority: CertificationAuthority
  ) => Audit;
  assignAuditCopies: (
    originalCopy: BalanceSheet,
    auditCopy: BalanceSheet
  ) => Audit;
};

export function makeAudit(opts?: AuditProps): Audit {
  const data = opts ?? {};

  function submitBalanceSheet(
    balanceSheet: BalanceSheet,
    certificationAuthority: CertificationAuthority
  ) {
    const copy = makeBalanceSheet({
      ...balanceSheet,
      id: undefined,
      organizationId: certificationAuthority.organizationId,
    });
    return makeAudit({
      ...data,
      submittedBalanceSheetId: balanceSheet.id,
      balanceSheetToCopy: copy,
      submittedAt: new Date(),
      certificationAuthorityName: certificationAuthority.name,
    });
  }

  function assignAuditCopies(
    originalCopy: BalanceSheet,
    auditCopy: BalanceSheet
  ): Audit {
    return makeAudit({
      ...data,
      balanceSheetToCopy: undefined,
      auditCopyId: auditCopy.id,
      originalCopyId: originalCopy.id,
    });
  }

  return deepFreeze({ submitBalanceSheet, ...data, assignAuditCopies });
}
