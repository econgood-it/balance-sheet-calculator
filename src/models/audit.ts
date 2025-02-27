import { BalanceSheet, makeBalanceSheet } from './balance.sheet';
import deepFreeze from 'deep-freeze';

type AuditProps = {
  id?: number;
  submittedBalanceSheetId?: number;
  balanceSheetCopy?: BalanceSheet;
};

export type Audit = AuditProps & {
  submitBalanceSheet: (
    balanceSheet: BalanceSheet,
    ecgAuditAdminId: number
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
      balanceSheetCopy: copy,
    });
  }

  return deepFreeze({ submitBalanceSheet, ...data });
}
