import {
  expectNumber,
  expectString,
  strictObjectMapper,
} from '@daniel-faber/json-ts';

export class TopicOrAspectDTO {
  public weight: number | undefined;

  public readonly estimations: number | undefined;

  public readonly isAspect: boolean;

  public constructor(
    public readonly shortName: string,
    weight: number | undefined,
    estimations: number | undefined
  ) {
    this.weight = weight;
    this.estimations = estimations;
    this.isAspect = shortName.length !== 2;
  }

  public static readonly fromJSON = strictObjectMapper(
    (accessor) =>
      new TopicOrAspectDTO(
        accessor.get('shortName', expectString),
        accessor.getOptional('weight', expectNumber),
        accessor.getOptional('estimations', expectNumber)
      )
  );
}
