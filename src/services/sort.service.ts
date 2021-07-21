import { BalanceSheet } from '../entities/balanceSheet';

export class SortService {
  public static sortArraysOfBalanceSheet(balanceSheet: BalanceSheet) {
    balanceSheet.rating.topics.sort((t1, t2) =>
      t1.shortName.localeCompare(t2.shortName)
    );
    balanceSheet.rating.topics.forEach((t) =>
      t.aspects.sort((a1, a2) => a1.shortName.localeCompare(a2.shortName))
    );
  }
}
