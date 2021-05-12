import { Topic } from '../../entities/topic';
import { none, Option, some } from '../../calculations/option';
import { roundWithPrecision } from '../../math';
import { staticTranslate, Translations } from '../../entities/Translations';

export class MatrixTopicDTO {
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

  public static fromTopic(
    topic: Topic,
    language: keyof Translations
  ): MatrixTopicDTO {
    const percentage = MatrixTopicDTO.percentage(topic.points, topic.maxPoints);
    const percentageReached = percentage.isPresent()
      ? percentage.get()
      : undefined;
    return new MatrixTopicDTO(
      topic.shortName,
      staticTranslate(language, topic.name),
      roundWithPrecision(topic.points),
      roundWithPrecision(topic.maxPoints),
      percentageReached,
      this.notApplicable(topic.weight)
    );
  }
}
