import { Worksheet } from 'exceljs';
import { RatingReader } from './rating.reader';
import { OldRating } from '../../models/oldRating';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { RatingsFactory } from '../../factories/ratings.factory';
import { filterUndef, range } from './reader.utils';

export class RatingSheet {
  private ratingReader = new RatingReader();
  private readonly balanceSheetType: BalanceSheetType;
  private maxRows = 93;
  private defaultRatings: OldRating[];
  constructor(
    private sheet: Worksheet,
    private balanceSheetVersion: BalanceSheetVersion
  ) {
    this.balanceSheetType = this.ratingReader.read(sheet.getRow(this.maxRows))
      ? BalanceSheetType.Full
      : BalanceSheetType.Compact;
    if (this.balanceSheetType === BalanceSheetType.Compact) {
      this.maxRows = 72;
    }
    this.defaultRatings = RatingsFactory.createDefaultRatings(
      this.balanceSheetType,
      balanceSheetVersion
    );
  }

  public toRatings(): OldRating[] {
    const ratings = filterUndef(
      range(9, this.maxRows).map((row) =>
        this.ratingReader.read(this.sheet.getRow(row))
      )
    );
    const foundShortNames = new Map<string, OldRating>();
    return this.defaultRatings.map((defaultRating) => {
      const foundRating = ratings.find(
        (r) =>
          r.shortName === defaultRating.shortName ||
          ((foundShortNames.has(r.shortName) ||
            r.shortName === '[object Object]') &&
            r.name === defaultRating.name)
      );
      if (!foundRating) {
        throw new Error(
          `Rating with shortName ${defaultRating.shortName} not found in Excel file`
        );
      }
      foundShortNames.set(defaultRating.shortName, defaultRating);
      return { ...foundRating, shortName: defaultRating.shortName };
    });
  }

  public getBalanceSheetType(): BalanceSheetType {
    return this.balanceSheetType;
  }
}
