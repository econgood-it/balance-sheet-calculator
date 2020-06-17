import { strictObjectMapper, expectString, expectNumber, arrayMapper } from '@daniel-faber/json-ts';
import { SupplyFraction } from './supplyFraction';
import { EmployeesFraction } from './employeesFraction';

export class CompanyFacts {
  public constructor(
    public readonly totalPurchaseFromSuppliers: number,
    public readonly totalStaffCosts: number,
    public readonly profit: number,
    public readonly financialCosts: number,
    public readonly incomeFromFinancialInvestments: number,
    public readonly additionsToFixedAssets: number,
    public readonly supplyFractions: SupplyFraction[],
    public readonly employeesFractions: EmployeesFraction[]
  ) { }

  public static readonly fromJSON = strictObjectMapper(
    accessor =>
      new CompanyFacts(
        accessor.get('totalPurchaseFromSuppliers', expectNumber),
        accessor.get('totalStaffCosts', expectNumber),
        accessor.get('profit', expectNumber),
        accessor.get('financialCosts', expectNumber),
        accessor.get('incomeFromFinancialInvestments', expectNumber),
        accessor.get('additionsToFixedAssets', expectNumber),
        accessor.get('supplyFractions', arrayMapper(SupplyFraction.fromJSON)),
        accessor.get('employeesFractions', arrayMapper(EmployeesFraction.fromJSON)),
      )
  );
}
