import { strictObjectMapper, expectString, expectNumber } from '@daniel-faber/json-ts';

export class TopicDTOUpdate {
    public constructor(
        public readonly id: number,
        public readonly estimations?: number,
        public weight?: number,
    ) { }

    public static readonly fromJSON = strictObjectMapper(
        accessor =>
            new TopicDTOUpdate(
                accessor.get('id', expectNumber),
                accessor.getOptional('estimations', expectNumber),
                accessor.getOptional('weight', expectNumber),
            ),
    );


}
