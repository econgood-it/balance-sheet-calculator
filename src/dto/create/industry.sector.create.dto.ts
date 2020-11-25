import { strictObjectMapper, expectString, expectNumber } from '@daniel-faber/json-ts';
import {IsAlpha, IsNumber, IsString, Length, Max, Min} from "class-validator";
import {IndustrySector} from "../../entities/industry.sector";

export class IndustrySectorCreateDtoCreate {

  @IsAlpha()
  @Length(1, 4)
  public readonly industryCode: string;
  @Min(0)
  @Max(1)
  @IsNumber()
  public readonly amountOfTotalTurnover: number;
  @IsString()
  public readonly description: string;
  constructor(industryCode: string, amountOfTotalTurnover: number, description: string) {
    this.industryCode = industryCode;
    this.amountOfTotalTurnover = amountOfTotalTurnover;
    this.description = description;
  }

  public static readonly fromJSON = strictObjectMapper(
    accessor =>
      new IndustrySectorCreateDtoCreate(
        accessor.get('industryCode', expectString),
        accessor.get('amountOfTotalTurnover', expectNumber),
        accessor.getOptional('description', expectString, ""),
      )
  );
  public toIndustrySector(): IndustrySector {
    return new IndustrySector(undefined, this.industryCode, this.amountOfTotalTurnover, this.description);
  }
}
