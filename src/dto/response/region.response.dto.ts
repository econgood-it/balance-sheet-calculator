import { Translations } from '../../entities/Translations';
import { Region } from '../../entities/region';

export class RegionResponseDTO {
  public constructor(
    public readonly countryCode: string,
    public readonly countryName: string
  ) {}

  public static fromRegion(
    region: Region,
    language: keyof Translations
  ): RegionResponseDTO {
    // TODO: Add translation of countryName
    return new RegionResponseDTO(region.countryCode, region.countryName);
  }
}
