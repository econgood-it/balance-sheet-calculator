import { strictObjectMapper, expectString, expectNumber, arrayMapper } from '@daniel-faber/json-ts';
import { Topic } from './topic';

export class Region {
  public constructor(
    public readonly pppIndex: number,
    public readonly countryCode: string,
    public readonly countryName: string
  ) { }
}
