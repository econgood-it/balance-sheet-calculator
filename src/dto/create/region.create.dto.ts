import { strictObjectMapper, expectString, expectNumber, arrayMapper, expectInteger } from '@daniel-faber/json-ts';
import { Region } from '../../entities/region';

export class RegionDTOCreate {

  public constructor(
    public readonly pppIndex: number,
    public readonly countryCode: string,
    public readonly countryName: string) {
  }

  public static readonly fromJSON = strictObjectMapper(
    accessor =>
      new RegionDTOCreate(
        accessor.get('pppIndex', expectNumber),
        accessor.get('countryCode', expectString),
        accessor.get('countryName', expectString),
      )
  );

  public toRegion(): Region {
    return new Region(undefined, this.pppIndex, this.countryCode, this.countryName);
  }
}
