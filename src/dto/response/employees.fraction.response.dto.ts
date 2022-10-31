import { EmployeesFraction } from '../../models/company.facts';

export class EmployeesFractionDTOResponse {
  public constructor(
    public readonly countryCode: string,
    public readonly percentage: number
  ) {}

  public static fromEmployeesFraction(
    employeesFraction: EmployeesFraction
  ): EmployeesFractionDTOResponse {
    return new EmployeesFractionDTOResponse(
      employeesFraction.countryCode,
      employeesFraction.percentage
    );
  }
}
