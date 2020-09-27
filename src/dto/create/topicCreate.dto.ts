import { strictObjectMapper, expectString, expectNumber, arrayMapper } from '@daniel-faber/json-ts';
import { Topic } from '../../entities/topic';
import { AspectDTOCreate } from './aspectCreate.dto';

export class TopicDTOCreate {

    public constructor(
        public readonly shortName: string,
        public readonly name: string,
        public readonly estimations: number,
        public weight: number | undefined,
        public isWeightSelectedByUser: boolean,
        public readonly aspects: AspectDTOCreate[],
    ) { }

    public static readonly fromJSON = strictObjectMapper(
        accessor => {
            const weight = accessor.getOptional('weight', expectNumber);
            return new TopicDTOCreate(
                accessor.get('shortName', expectString),
                accessor.get('name', expectString),
                accessor.get('estimations', expectNumber),
                weight,
                weight ? true : false,
                accessor.get('aspects', arrayMapper(AspectDTOCreate.fromJSON)),
            );
        }
    );
    public toTopic(): Topic {
        const weight = this.weight ? this.weight : 1;
        return new Topic(undefined, this.shortName, this.name, this.estimations, 0, 51, weight, this.isWeightSelectedByUser,
            this.aspects.map(a => a.toAspect()))
    }
}
