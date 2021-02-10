import {Topic} from "../../entities/topic";

export class MatrixTopicDTO {

  constructor(public readonly shortName: string,
              public readonly name: string,
              public readonly pointsReached: string,
              public readonly percentageReached: string,
              public readonly notApplicable: boolean) {
  }

  private static percentage(points: number, maxPoints: number): number {
    if (maxPoints == 0) {
      return 0;
    }
    return points / maxPoints * 100;
  }

  private static notApplicable(weight: number): boolean {
    return weight === 0 ? true : false;
  }

  public static fromTopic(topic: Topic): MatrixTopicDTO {
    const pointsReached = `${topic.points} of ${topic.maxPoints}`;
    const percentage = MatrixTopicDTO.percentage(topic.points, topic.maxPoints);
    const percentageReached = percentage >= 0 ? `${percentage.toFixed()} %` : '';
    return new MatrixTopicDTO(topic.shortName, topic.name, pointsReached, percentageReached,
      this.notApplicable(topic.weight));
  }

}