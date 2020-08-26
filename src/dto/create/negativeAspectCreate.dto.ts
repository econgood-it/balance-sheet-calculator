import { strictObjectMapper, expectString, expectNumber, expectBoolean } from '@daniel-faber/json-ts';
import { NegativeAspect } from '../../entities/negativeAspect';

export class NegativeAspectDTOCreate {

    public constructor(
        public readonly shortName: string,
        public readonly name: string,
        public readonly estimations: number,
    ) { }

    public static readonly fromJSON = strictObjectMapper(
        accessor =>
            new NegativeAspectDTOCreate(
                accessor.get('shortName', expectString),
                accessor.get('name', expectString),
                accessor.get('estimations', expectNumber),
            ),
    );
    public toNegativeAspect(): NegativeAspect {
        return new NegativeAspect(undefined, this.shortName, this.name, this.estimations, 0, 51);
    }
}
