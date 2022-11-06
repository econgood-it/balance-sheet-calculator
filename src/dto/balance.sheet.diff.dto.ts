import { diff } from 'deep-diff';
import { BalanceSheet } from '../models/balance.sheet';
import { z } from 'zod';

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

const DiffSchema = z.any();

export const BalanceSheetExcelDiffResponseBody = z.object({
  lhs: z.string(),
  rhs: z.string(),
  diffStakeHolderWeights: DiffSchema.optional(),
  diffTopicWeights: DiffSchema.optional(),
  diffCalc: DiffSchema.optional(),
  diff: DiffSchema.optional(),
});
