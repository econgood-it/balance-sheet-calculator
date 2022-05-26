import { Translations } from '../../entities/Translations';
import { Industry } from '../../entities/industry';

export class IndustryResponseDTO {
  public constructor(
    public readonly industryCode: string,
    public readonly industryName: string
  ) {}

  public static fromIndustry(
    industry: Industry,
    language: keyof Translations
  ): IndustryResponseDTO {
    // TODO: Add translation of industryName
    return new IndustryResponseDTO(industry.industryCode, industry.name);
  }
}
