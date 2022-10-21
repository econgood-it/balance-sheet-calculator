import { Region } from '../../models/region';

export class RegionResponseDTO {
  public constructor(
    public readonly countryCode: string,
    public readonly countryName: string
  ) {}

  public static fromRegion(region: Region): RegionResponseDTO {
    return new RegionResponseDTO(region.countryCode, region.countryName);
  }
}
