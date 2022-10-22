import { Translations } from '../../entities/Translations';
import { IndustrySector } from '../../models/balance.sheet';

export class IndustrySectorDtoResponse {
  constructor(
    public readonly industryCode: string,
    public readonly amountOfTotalTurnover: number,
    public readonly description: string
  ) {}

  public static fromIndustrySector(
    industrySector: IndustrySector
  ): IndustrySectorDtoResponse {
    return new IndustrySectorDtoResponse(
      industrySector.industryCode,
      industrySector.amountOfTotalTurnover,
      industrySector.description
    );
  }
}
