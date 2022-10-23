import { none, Option, some } from '../../calculations/option';
import { roundWithPrecision } from '../../math';
import { staticTranslate, Translations } from '../../entities/Translations';
import { Rating } from '../../models/rating';

export class MatrixRatingDto {
  constructor(
    public readonly shortName: string,
    public readonly name: string,
    public readonly points: number,
    public readonly maxPoints: number,
    public readonly percentageReached: number | undefined,
    public readonly notApplicable: boolean
  ) {}

  private static percentage(points: number, maxPoints: number): Option<number> {
    if (maxPoints === 0 || points < 0) {
      return none();
    }
    return some(roundWithPrecision(points / maxPoints, 1) * 100);
  }

  private static notApplicable(weight: number): boolean {
    return weight === 0;
  }

  public static fromRating(
    rating: Rating,
    language: keyof Translations
  ): MatrixRatingDto {
    const percentage = MatrixRatingDto.percentage(
      rating.points,
      rating.maxPoints
    );
    const percentageReached = percentage.isPresent()
      ? percentage.get()
      : undefined;
    return new MatrixRatingDto(
      rating.shortName,
      staticTranslate(language, rating.name),
      roundWithPrecision(rating.points),
      roundWithPrecision(rating.maxPoints),
      percentageReached,
      this.notApplicable(rating.weight)
    );
  }
}
