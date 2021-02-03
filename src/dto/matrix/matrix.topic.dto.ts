import {Topic} from "../../entities/topic";
import {Option, some} from "../../calculations/option";

export class MatrixTopicDTO {

  constructor(public readonly shortName: string,
              public readonly name: string,
              public readonly pointsReached: string,
              public readonly percentageReached: string) {
  }

  private static percentage(points: number, maxPoints: number): number {
    if (maxPoints == 0) {
      return 0;
    }
    return points / maxPoints * 100;
  }

  public static fromTopic(topic: Topic): MatrixTopicDTO {
    const pointsReached = `${topic.points} of ${topic.maxPoints}`;
    const percentage = MatrixTopicDTO.percentage(topic.points, topic.maxPoints);
    const percentageReached = percentage >= 0 ? `${percentage.toFixed()} %` : '';
    return new MatrixTopicDTO(topic.shortName, topic.name, pointsReached, percentageReached);
  }

}