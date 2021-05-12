import {
  strictObjectMapper,
  expectString,
  expectNumber,
  arrayMapper,
} from '@daniel-faber/json-ts';
import { AspectDTOUpdate } from './aspect.update.dto';
import { IsIn, IsOptional, ValidateNested } from 'class-validator';
import { WEIGHT_VALUES } from '../validation.constants';

export class TopicDTOUpdate {
  @IsOptional()
  @IsIn(WEIGHT_VALUES)
  public weight: number | undefined;

  @ValidateNested()
  public aspects: AspectDTOUpdate[];

  public constructor(
    public readonly shortName: string,
    weight: number | undefined,
    aspects: AspectDTOUpdate[]
  ) {
    this.aspects = aspects;
    this.weight = weight;
  }

  public static readonly fromJSON = strictObjectMapper(
    (accessor) =>
      new TopicDTOUpdate(
        accessor.get('shortName', expectString),
        accessor.getOptional('weight', expectNumber),
        accessor.getOptional(
          'aspects',
          arrayMapper(AspectDTOUpdate.fromJSON),
          []
        )
      )
  );
}
