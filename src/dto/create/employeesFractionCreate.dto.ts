import { strictObjectMapper, expectString, expectNumber, arrayMapper } from '@daniel-faber/json-ts';
import { EmployeesFraction } from '../../entities/employeesFraction';
import {IsAlpha, IsNumber, IsUppercase, Length, Max, Min} from "class-validator";

export class EmployeesFractionDTOCreate {

  @IsAlpha()
  @Length(3, 3)
  @IsUppercase()
  public readonly countryCode: string;
  @Min(0)
  @Max(1)
  @IsNumber()
  public readonly percentage: number;

  public constructor(
    countryCode: string,
    percentage: number
  ) {
    this.countryCode = countryCode;
    this.percentage = percentage;
  }

  public static readonly fromJSON = strictObjectMapper(
    accessor =>
      new EmployeesFractionDTOCreate(
        accessor.get('countryCode', expectString),
        accessor.get('percentage', expectNumber)
      )
  );

  public toEmployeesFraction(): EmployeesFraction {
    return new EmployeesFraction(undefined, this.countryCode, this.percentage);
  }
}
