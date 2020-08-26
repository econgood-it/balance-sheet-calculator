import { strictObjectMapper, expectString, expectNumber, expectBoolean } from '@daniel-faber/json-ts';
import { PositiveAspect } from '../../entities/positiveAspect';

export class PositiveAspectDTOCreate {

    public constructor(
        public readonly shortName: string,
        public readonly name: string,
        public readonly estimations: number,
        public weight: number
    ) { }

    public static readonly fromJSON = strictObjectMapper(
        accessor =>
            new PositiveAspectDTOCreate(
                accessor.get('shortName', expectString),
                accessor.get('name', expectString),
                accessor.get('estimations', expectNumber),
                accessor.get('weight', expectNumber)
            ),
    );
    public toPositiveAspect(): PositiveAspect {
        return new PositiveAspect(undefined, this.shortName, this.name, this.estimations, 0, 51, this.weight);
    }
}
