import { BalanceSheet, makeBalanceSheet } from './balance.sheet';
import deepFreeze from 'deep-freeze';

type AuditProps = {
  id?: number;
  submittedBalanceSheetId?: number;
  originalCopyId?: number;
  auditCopyId?: number;
  balanceSheetToCopy?: BalanceSheet;
};

export type Audit = AuditProps & {
  submitBalanceSheet: (
    balanceSheet: BalanceSheet,
    ecgAuditAdminId: number
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
    ecgAuditAdminId: number
  ) {
    const copy = makeBalanceSheet({
      ...balanceSheet,
      id: undefined,
      organizationId: ecgAuditAdminId,
    });
    return makeAudit({
      ...data,
      submittedBalanceSheetId: balanceSheet.id,
      balanceSheetToCopy: copy,
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
