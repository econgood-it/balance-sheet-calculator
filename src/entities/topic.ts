import { strictObjectMapper, expectString, expectNumber } from '@daniel-faber/json-ts';

export class Topic {
  public constructor(
    public readonly shortName: string,
    public readonly name: string,
    public readonly estimations: number,
    public points: number,
    public maxPoints: number | undefined,
    public weight: number
  ) { }

  public static readonly fromJSON = strictObjectMapper(
    accessor =>
      new Topic(
        accessor.get('shortName', expectString),
        accessor.get('name', expectString),
        accessor.get('estimations', expectNumber),
        accessor.get('points', expectNumber),
        accessor.getOptional('maxPoints', expectNumber),
        accessor.get('weight', expectNumber)
      ),
  );
}
