import {
  strictObjectMapper,
  expectString,
  expectNumber,
} from '@daniel-faber/json-ts';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { WEIGHT_VALUES } from '../validation.constants';

export class TopicOrAspectDTO {
  @IsOptional()
  @IsIn(WEIGHT_VALUES)
  public weight: number | undefined;

  @IsInt()
  @Min(-200)
  @Max(10)
  @IsOptional()
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
