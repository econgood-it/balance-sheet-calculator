import {Topic} from "../../entities/topic";
import {AspectDTOResponse} from "./aspect.response.dto";
import {staticTranslate, Translations} from "../../entities/Translations";

export class TopicDTOResponse {

  public constructor(
    public readonly id: number | undefined,
    public readonly shortName: string,
    public name: string,
    public estimations: number,
    public points: number = 0,
    public maxPoints: number = 0,
    public isWeightSelectedByUser: boolean,
    public readonly weight: number,
    public readonly aspects: AspectDTOResponse[],
  ) {
  }

  public static fromTopic(topic: Topic, language: keyof Translations): TopicDTOResponse {
    return new TopicDTOResponse(topic.id, topic.shortName, staticTranslate(language, topic.name),
      topic.estimations, topic.points, topic.maxPoints, topic.isWeightSelectedByUser, topic.weight,
      topic.aspects.map(a => AspectDTOResponse.fromAspect(a, language)));
  }
}
