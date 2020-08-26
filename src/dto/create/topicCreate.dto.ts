import { strictObjectMapper, expectString, expectNumber, arrayMapper } from '@daniel-faber/json-ts';
import { Topic } from '../../entities/topic';
import { PositiveAspectDTOCreate } from './positiveAspectCreate.dto';
import { NegativeAspectDTOCreate } from './negativeAspectCreate.dto';

export class TopicDTOCreate {

    public constructor(
        public readonly shortName: string,
        public readonly name: string,
        public readonly estimations: number,
        public weight: number,
        public readonly positiveAspects: PositiveAspectDTOCreate[],
        public readonly negativeAspects: NegativeAspectDTOCreate[],
    ) { }

    public static readonly fromJSON = strictObjectMapper(
        accessor =>
            new TopicDTOCreate(
                accessor.get('shortName', expectString),
                accessor.get('name', expectString),
                accessor.get('estimations', expectNumber),
                accessor.get('weight', expectNumber),
                accessor.get('positveAspects', arrayMapper(PositiveAspectDTOCreate.fromJSON)),
                accessor.get('negativeAspects', arrayMapper(NegativeAspectDTOCreate.fromJSON)),
            ),
    );
    public toTopic(): Topic {
        return new Topic(undefined, this.shortName, this.name, this.estimations, 0, 51, this.weight,
            this.positiveAspects.map(a => a.toPositiveAspect()),
            this.negativeAspects.map(a => a.toNegativeAspect()));
    }
}
