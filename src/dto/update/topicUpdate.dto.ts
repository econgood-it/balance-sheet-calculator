import { strictObjectMapper, expectString, expectNumber, JsonObjectAccessor, arrayMapper } from '@daniel-faber/json-ts';
import { PositiveAspectDTOUpdate } from './positiveAspectUpdate.dto';
import { BalanceSheetType } from '../../entities/enums';
import { NegativeAspectDTOUpdate } from './negativeAspectUpdate.dto';

export class TopicDTOUpdate {
    public constructor(
        public readonly id: number,
        public readonly estimations: number | undefined,
        public weight: number | undefined,
        public positiveAspects: PositiveAspectDTOUpdate[],
        public negativeAspects: NegativeAspectDTOUpdate[]
    ) { }

    public static readonly fromJSONCompact = strictObjectMapper(
        accessor => TopicDTOUpdate.fromJSON(accessor, BalanceSheetType.Compact)
    );

    public static readonly fromJSONFull = strictObjectMapper(
        accessor => TopicDTOUpdate.fromJSON(accessor, BalanceSheetType.Full)
    );

    private static fromJSON(accessor: JsonObjectAccessor, balanceSheetType: BalanceSheetType) {
        return new TopicDTOUpdate(
            accessor.get('id', expectNumber),
            balanceSheetType === BalanceSheetType.Compact ? accessor.getOptional('estimations', expectNumber) : undefined,
            accessor.getOptional('weight', expectNumber),
            accessor.getOptional('positiveAspects', arrayMapper(PositiveAspectDTOUpdate.fromJSON), []),
            accessor.getOptional('negativeAspects', arrayMapper(NegativeAspectDTOUpdate.fromJSON), [])
        );
    }


}
