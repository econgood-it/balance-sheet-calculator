import { strictObjectMapper, expectString, expectNumber, arrayMapper } from '@daniel-faber/json-ts';
import { EmployeesFraction } from '../../entities/employeesFraction';

export class EmployeesFractionDTOCreate {

  public constructor(
    public readonly countryCode: string,
    public readonly percentage: number
  ) { }

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
