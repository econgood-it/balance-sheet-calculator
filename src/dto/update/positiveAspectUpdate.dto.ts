import { strictObjectMapper, expectString, expectNumber, expectBoolean } from '@daniel-faber/json-ts';
import { PositiveAspect } from '../../entities/positiveAspect';

export class PositiveAspectDTOUpdate {

    public constructor(
        public readonly id: number,
        public readonly estimations?: number,
        public weight?: number,
    ) { }

    public static readonly fromJSON = strictObjectMapper(
        accessor => new PositiveAspectDTOUpdate(
            accessor.get('id', expectNumber),
            accessor.getOptional('estimations', expectNumber),
            accessor.getOptional('weight', expectNumber)
        )
    );
}
