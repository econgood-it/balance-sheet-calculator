import { strictObjectMapper, expectString, expectNumber } from '@daniel-faber/json-ts';
import { Aspect } from '../../entities/aspect';

export class AspectDTOCreate {

    public constructor(
        public readonly shortName: string,
        public readonly name: string,
        public readonly estimations: number,
        public weight: number,
    ) { }

    public static readonly fromJSON = strictObjectMapper(
        accessor =>
            new AspectDTOCreate(
                accessor.get('shortName', expectString),
                accessor.get('name', expectString),
                accessor.get('estimations', expectNumber),
                accessor.get('weight', expectNumber),
            ),
    );
    public toAspect(): Aspect {
        return new Aspect(undefined, this.shortName, this.name, this.estimations, 0, 51, this.weight);
    }
}
