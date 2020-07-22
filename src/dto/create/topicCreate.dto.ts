import { strictObjectMapper, expectString, expectNumber } from '@daniel-faber/json-ts';
import { Topic } from '../../entities/topic';

export class TopicDTOCreate {

    public constructor(
        public readonly shortName: string,
        public readonly name: string,
        public readonly estimations: number,
        public weight: number,
    ) { }

    public static readonly fromJSON = strictObjectMapper(
        accessor =>
            new TopicDTOCreate(
                accessor.get('shortName', expectString),
                accessor.get('name', expectString),
                accessor.get('estimations', expectNumber),
                accessor.get('weight', expectNumber),
            ),
    );
    public toTopic(): Topic {
        return new Topic(undefined, this.shortName, this.name, this.estimations, this.weight);
    }
}
