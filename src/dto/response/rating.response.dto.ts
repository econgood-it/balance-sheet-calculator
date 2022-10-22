import { staticTranslate, Translations } from '../../entities/Translations';
import { isTopic, Rating } from '../../models/balance.sheet';

export class RatingResponseDTO {
  public constructor(
    public readonly shortName: string,
    public readonly name: string,
    public readonly weight: number,
    public readonly estimations: number | null,
    public readonly points: number,
    public readonly maxPoints: number,
    public readonly isPositive: boolean,
    public readonly type: string
  ) {}

  public static fromRating(
    rating: Rating,
    language: keyof Translations
  ): RatingResponseDTO {
    return new RatingResponseDTO(
      rating.shortName,
      staticTranslate(language, rating.name),
      rating.weight,
      rating.estimations,
      rating.points,
      rating.maxPoints,
      rating.isPositive,
      isTopic(rating) ? 'topic' : 'aspect'
    );
  }
}
