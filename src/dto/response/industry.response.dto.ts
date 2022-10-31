import { Industry } from '../../models/industry';

export class IndustryResponseDTO {
  public constructor(
    public readonly industryCode: string,
    public readonly industryName: string
  ) {}

  public static fromIndustry(industry: Industry): IndustryResponseDTO {
    return new IndustryResponseDTO(industry.industryCode, industry.name);
  }
}
