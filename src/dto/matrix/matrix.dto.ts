import { MatrixRatingDto } from './matrix.rating.dto';
import { BalanceSheet } from '../../models/balance.sheet';
import { filterTopics, sortRatings } from '../../models/rating';

export class MatrixDTO {
  constructor(public readonly ratings: MatrixRatingDto[]) {}

  public static fromBalanceSheet(balanceSheet: BalanceSheet): MatrixDTO {
    return new MatrixDTO(
      filterTopics(sortRatings(balanceSheet.ratings)).map((r) =>
        MatrixRatingDto.fromRating(r)
      )
    );
  }
}
