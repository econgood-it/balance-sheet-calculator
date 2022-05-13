import { diff } from 'deep-diff';
import { BalanceSheet } from '../../entities/balanceSheet';

export const diffBetweenBalanceSheets = (
  balanceSheet: BalanceSheet,
  otherBalanceSheet: BalanceSheet
) => {
  const differences = diff(balanceSheet, otherBalanceSheet);
  return differences?.map((d) =>
    d.path && d.path.length >= 2 && d.path[0] === 'ratings'
      ? {
          ...d,
          shortName: balanceSheet.ratings[d.path[1]].shortName,
        }
      : d
  );
};
