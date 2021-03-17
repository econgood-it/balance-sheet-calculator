import {Aspect} from "../../entities/aspect";
import {Translations} from "../../entities/Translations";

export class AspectDTOResponse {

  public constructor(
    public readonly id: number | undefined,
    public readonly shortName: string,
    public readonly name: string,
    public readonly points: number,
    public readonly maxPoints: number,
    public readonly isWeightSelectedByUser: boolean,
    public readonly isPositive: boolean,
    public readonly estimations: number,
    public readonly weight: number,
  ) {
  }

  public static fromAspect(aspect: Aspect, language: keyof Translations): AspectDTOResponse {
    return new AspectDTOResponse(aspect.id, aspect.shortName,
      aspect.name, aspect.points, aspect.maxPoints, aspect.isWeightSelectedByUser,
      aspect.isPositive, aspect.estimations, aspect.weight);
  }
}
