import { strictObjectMapper, expectNumber } from '@daniel-faber/json-ts';

export class NegativeAspectDTOUpdate {

    public constructor(
        public readonly id: number,
        public readonly estimations?: number,
    ) { }

    public static readonly fromJSON = strictObjectMapper(
        accessor => new NegativeAspectDTOUpdate(
            accessor.get('id', expectNumber),
            accessor.getOptional('estimations', expectNumber),
        )
    );
}
