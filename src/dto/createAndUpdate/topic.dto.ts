import {
  strictObjectMapper,
  expectString,
  expectNumber,
  arrayMapper,
} from '@daniel-faber/json-ts';
import { AspectDTO } from './aspect.dto';
import { IsIn, IsOptional, ValidateNested } from 'class-validator';
import { WEIGHT_VALUES } from '../validation.constants';

export class TopicDTO {
  @IsOptional()
  @IsIn(WEIGHT_VALUES)
  public weight: number | undefined;

  @ValidateNested()
  public aspects: AspectDTO[];

  public constructor(
    public readonly shortName: string,
    weight: number | undefined,
    aspects: AspectDTO[]
  ) {
    this.aspects = aspects;
    this.weight = weight;
  }

  public static readonly fromJSON = strictObjectMapper(
    (accessor) =>
      new TopicDTO(
        accessor.get('shortName', expectString),
        accessor.getOptional('weight', expectNumber),
        accessor.getOptional('aspects', arrayMapper(AspectDTO.fromJSON), [])
      )
  );
}
