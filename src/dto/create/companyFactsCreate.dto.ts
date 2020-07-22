import { strictObjectMapper, expectNumber, arrayMapper } from '@daniel-faber/json-ts';
import { SupplyFractionDTOCreate } from './supplyFractionCreate.dto';
import { EmployeesFractionDTOCreate } from './employeesFractionCreate.dto';
import { CompanyFacts } from '../../entities/companyFacts';

export class CompanyFactsDTOCreate {

  public constructor(
    public readonly totalPurchaseFromSuppliers: number,
    public readonly totalStaffCosts: number,
    public readonly profit: number,
    public readonly financialCosts: number,
    public readonly incomeFromFinancialInvestments: number,
    public readonly additionsToFixedAssets: number,
    public readonly supplyFractions: SupplyFractionDTOCreate[],
    public readonly employeesFractions: EmployeesFractionDTOCreate[]
  ) {
  }

  public static readonly fromJSON = strictObjectMapper(
    accessor =>
      new CompanyFactsDTOCreate(
        accessor.get('totalPurchaseFromSuppliers', expectNumber),
        accessor.get('totalStaffCosts', expectNumber),
        accessor.get('profit', expectNumber),
        accessor.get('financialCosts', expectNumber),
        accessor.get('incomeFromFinancialInvestments', expectNumber),
        accessor.get('additionsToFixedAssets', expectNumber),
        accessor.get('supplyFractions', arrayMapper(SupplyFractionDTOCreate.fromJSON)),
        accessor.get('employeesFractions', arrayMapper(EmployeesFractionDTOCreate.fromJSON)),
      )
  );

  public toCompanyFacts(): CompanyFacts {
    return new CompanyFacts(undefined, this.totalPurchaseFromSuppliers, this.totalStaffCosts, this.profit, this.financialCosts,
      this.incomeFromFinancialInvestments, this.additionsToFixedAssets, this.supplyFractions.map(sf => sf.toSupplyFraction()),
      this.employeesFractions.map(ef => ef.toEmployeesFraction()));
  }
}
