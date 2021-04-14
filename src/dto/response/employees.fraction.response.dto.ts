import {EmployeesFraction} from "../../entities/employeesFraction";
import {Translations} from "../../entities/Translations";

export class EmployeesFractionDTOResponse {

  public constructor(
    public readonly id: number | undefined,
    public readonly countryCode: string,
    public readonly percentage: number,
  ) {
  }

  public static fromEmployeesFraction(employeesFraction: EmployeesFraction, language: keyof Translations): EmployeesFractionDTOResponse {
    return new EmployeesFractionDTOResponse(employeesFraction.id,
      employeesFraction.countryCode, employeesFraction.percentage);
  }
}
