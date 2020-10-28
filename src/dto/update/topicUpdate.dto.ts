import { strictObjectMapper, expectString, expectNumber, JsonObjectAccessor, arrayMapper } from '@daniel-faber/json-ts';
import { AspectDTOUpdate } from './aspectUpdate.dto';
import { BalanceSheetType } from '../../entities/enums';
import {IsIn, IsInt, IsOptional, Max, Min, ValidateNested} from 'class-validator';
import {WEIGHT_VALUES} from "../validation.constants";

export class TopicDTOUpdate {
    @IsInt()
    @Min(0)
    @Max(10)
    @IsOptional()
    public readonly estimations: number | undefined;
    @IsOptional()
    @IsIn(WEIGHT_VALUES)
    public weight: number | undefined;
    @ValidateNested()
    public aspects: AspectDTOUpdate[];
    public constructor(
        public readonly shortName: string,
        estimations: number | undefined,
        weight: number | undefined,
        aspects: AspectDTOUpdate[]
    ) {
        this.aspects = aspects;
        this.estimations = estimations;
        this.weight = weight;
    }

    public static readonly fromJSONCompact = strictObjectMapper(
        accessor => TopicDTOUpdate.fromJSON(accessor, BalanceSheetType.Compact)
    );

    public static readonly fromJSONFull = strictObjectMapper(
        accessor => TopicDTOUpdate.fromJSON(accessor, BalanceSheetType.Full)
    );

    private static fromJSON(accessor: JsonObjectAccessor, balanceSheetType: BalanceSheetType) {
        return new TopicDTOUpdate(
            accessor.get('shortName', expectString),
            balanceSheetType === BalanceSheetType.Compact ? accessor.getOptional('estimations', expectNumber) : undefined,
            accessor.getOptional('weight', expectNumber),
            accessor.getOptional('aspects', arrayMapper(AspectDTOUpdate.fromJSON), []),
        );
    }


}
