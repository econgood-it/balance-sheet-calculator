import { strictObjectMapper, expectString, expectNumber } from '@daniel-faber/json-ts';
import {IsAlpha, IsNumber, IsOptional, IsString, Length, Max, Min} from "class-validator";
import {IndustrySector} from "../../entities/industry.sector";
import {Aspect} from "../../entities/aspect";
import {Translations} from "../../entities/Translations";
import {Column, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {CompanyFacts} from "../../entities/companyFacts";

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
      industrySector.description[language]);
  }
}
