import { strictObjectMapper, expectString, expectNumber, expectBoolean } from '@daniel-faber/json-ts';

export class AspectDTOUpdate {

    public constructor(
        public readonly shortName: string,
        public readonly estimations?: number,
        public weight?: number,
    ) { }

    public static readonly fromJSON = strictObjectMapper(
        accessor => new AspectDTOUpdate(
            accessor.get('shortName', expectString),
            accessor.getOptional('estimations', expectNumber),
            accessor.getOptional('weight', expectNumber)
        )
    );
}
