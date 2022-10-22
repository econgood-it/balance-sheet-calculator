import { MatrixRatingDto } from './matrix.rating.dto';
import { Translations } from '../../entities/Translations';
import {
  BalanceSheet,
  filterTopics,
  sortRatings,
} from '../../models/balance.sheet';

export class MatrixDTO {
  constructor(public readonly ratings: MatrixRatingDto[]) {}

  public static fromBalanceSheet(
    balanceSheet: BalanceSheet,
    language: keyof Translations
  ): MatrixDTO {
    return new MatrixDTO(
      filterTopics(sortRatings(balanceSheet.ratings)).map((r) =>
        MatrixRatingDto.fromRating(r, language)
      )
    );
  }
}
