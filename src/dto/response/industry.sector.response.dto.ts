import {IndustrySector} from "../../entities/industry.sector";
import {getTranslationOfLanguage, Translations} from "../../entities/Translations";

export class IndustrySectorDtoResponse {

  constructor(
    public readonly id: number | undefined,
    public readonly industryCode: string,
    public readonly amountOfTotalTurnover: number,
    public readonly description: string
  ) {
  }

  public static fromIndustrySector(industrySector: IndustrySector, language: keyof Translations): IndustrySectorDtoResponse {
    return new IndustrySectorDtoResponse(industrySector.id,
      industrySector.industryCode, industrySector.amountOfTotalTurnover,
      getTranslationOfLanguage(industrySector.description, language));
  }
}
