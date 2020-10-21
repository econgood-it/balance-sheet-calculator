import { strictObjectMapper, expectString, expectNumber, expectBoolean, JsonMappingError } from '@daniel-faber/json-ts';
import {
    IsOptional,
    IsInt,
    Min,
    Max,
    IsIn
} from 'class-validator';

export class AspectDTOUpdate {

    private static readonly WEIGHT_VALUES = [0, 0.5, 1, 1.5, 2];
    @IsInt()
    @Min(0)
    @Max(10)
    @IsOptional()
    public readonly estimations?: number

    @IsOptional()
    @IsIn(AspectDTOUpdate.WEIGHT_VALUES)
    public weight?: number;

    public constructor(
        public readonly shortName: string,
        estimations?: number,
        weight?: number,
    ) {
        this.estimations = estimations;
        this.weight = weight;
    }

    public static readonly fromJSON = strictObjectMapper(
        accessor =>
            new AspectDTOUpdate(
                accessor.get('shortName', expectString),
                accessor.getOptional('estimations', expectNumber),
                accessor.getOptional('weight', expectNumber)
            )
    );
}
