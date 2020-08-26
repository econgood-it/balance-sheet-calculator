import { strictObjectMapper, expectString, expectNumber, arrayMapper } from '@daniel-faber/json-ts';
import { Topic } from '../../entities/topic';
import { Aspect } from '../../entities/aspect';
import { AspectDTOCreate } from './aspectCreate.dto';

export class TopicDTOCreate {

    public constructor(
        public readonly shortName: string,
        public readonly name: string,
        public readonly estimations: number,
        public weight: number,
        public readonly aspects: AspectDTOCreate[],
    ) { }

    public static readonly fromJSON = strictObjectMapper(
        accessor =>
            new TopicDTOCreate(
                accessor.get('shortName', expectString),
                accessor.get('name', expectString),
                accessor.get('estimations', expectNumber),
                accessor.get('weight', expectNumber),
                accessor.get('aspects', arrayMapper(AspectDTOCreate.fromJSON)),
            ),
    );
    public toTopic(): Topic {
        return new Topic(undefined, this.shortName, this.name, this.estimations, 0, 51, this.weight,
            this.aspects.map(t => t.toAspect()));
    }
}
