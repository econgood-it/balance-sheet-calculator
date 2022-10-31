import { isTopic, Rating } from '../../models/rating';

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

  public static fromRating(rating: Rating): RatingResponseDTO {
    return new RatingResponseDTO(
      rating.shortName,
      rating.name,
      rating.weight,
      rating.estimations,
      rating.points,
      rating.maxPoints,
      rating.isPositive,
      isTopic(rating) ? 'topic' : 'aspect'
    );
  }
}
