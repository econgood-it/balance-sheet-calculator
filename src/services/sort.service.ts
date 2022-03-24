import { BalanceSheet } from '../entities/balanceSheet';

export class SortService {
  public static sortArraysOfBalanceSheet(balanceSheet: BalanceSheet) {
    balanceSheet.ratings.sort((r1, r2) =>
      r1.shortName.localeCompare(r2.shortName)
    );
  }
}
