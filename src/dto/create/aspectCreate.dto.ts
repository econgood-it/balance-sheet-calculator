import { strictObjectMapper, expectString, expectNumber, expectBoolean } from '@daniel-faber/json-ts';
import { Aspect } from '../../entities/aspect';

export class AspectDTOCreate {

    public constructor(
        public readonly shortName: string,
        public readonly name: string,
        public readonly estimations: number,
        public weight: number | undefined,
        public isWeightSelectedByUser: boolean,
        public isPositive: boolean
    ) { }

    public static readonly fromJSON = strictObjectMapper(
        accessor => {
            const weight = accessor.getOptional('weight', expectNumber);
            return new AspectDTOCreate(
                accessor.get('shortName', expectString),
                accessor.get('name', expectString),
                accessor.get('estimations', expectNumber),
                weight,
                weight ? true : false,
                accessor.get('isPositive', expectBoolean)
            );
        }
    );
    public toAspect(): Aspect {
        const weight = this.weight ? this.weight : 1;
        return new Aspect(undefined, this.shortName, this.name, this.estimations, 0, 51, weight,
            this.isWeightSelectedByUser, this.isPositive);
    }
}
