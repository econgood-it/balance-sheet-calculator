import { MatrixRatingDto } from './matrix.rating.dto';
import { Translations } from '../../entities/Translations';
import { BalanceSheet } from '../../entities/balanceSheet';

export class MatrixDTO {
  constructor(public readonly ratings: MatrixRatingDto[]) {}

  public static fromBalanceSheet(
    balanceSheet: BalanceSheet,
    language: keyof Translations
  ): MatrixDTO {
    return new MatrixDTO(
      balanceSheet
        .getTopics()
        .map((r) => MatrixRatingDto.fromRating(r, language))
    );
  }
}
