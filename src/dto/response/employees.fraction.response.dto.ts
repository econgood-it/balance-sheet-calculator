import { Translations } from '../../entities/Translations';
import { EmployeesFraction } from '../../models/balance.sheet';

export class EmployeesFractionDTOResponse {
  public constructor(
    public readonly countryCode: string,
    public readonly percentage: number
  ) {}

  public static fromEmployeesFraction(
    employeesFraction: EmployeesFraction,
    language: keyof Translations
  ): EmployeesFractionDTOResponse {
    return new EmployeesFractionDTOResponse(
      employeesFraction.countryCode,
      employeesFraction.percentage
    );
  }
}
