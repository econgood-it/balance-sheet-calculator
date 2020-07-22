import { strictObjectMapper, expectNumber, arrayMapper } from '@daniel-faber/json-ts';
import { SupplyFractionDTOCreate } from '../create/supplyFractionCreate.dto';
import { EmployeesFractionDTOCreate } from '../create/employeesFractionCreate.dto';
import { SupplyFractionDTOUpdate } from './supplyFractionUpdate.dto';
import { EmployeesFractionDTOUpdate } from './employeesFractionUpdate.dto';

export class CompanyFactsDTOUpdate {

  public constructor(
    public readonly id: number,
    public readonly totalPurchaseFromSuppliers?: number,
    public readonly totalStaffCosts?: number,
    public readonly profit?: number,
    public readonly financialCosts?: number,
    public readonly incomeFromFinancialInvestments?: number,
    public readonly additionsToFixedAssets?: number,
    public readonly supplyFractions?: SupplyFractionDTOUpdate[],
    public readonly employeesFractions?: EmployeesFractionDTOUpdate[]
  ) {
  }

  public static readonly fromJSON = strictObjectMapper(
    accessor =>
      new CompanyFactsDTOUpdate(
        accessor.get('id', expectNumber),
        accessor.getOptional('totalPurchaseFromSuppliers', expectNumber),
        accessor.getOptional('totalStaffCosts', expectNumber),
        accessor.getOptional('profit', expectNumber),
        accessor.getOptional('financialCosts', expectNumber),
        accessor.getOptional('incomeFromFinancialInvestments', expectNumber),
        accessor.getOptional('additionsToFixedAssets', expectNumber),
        accessor.getOptional('supplyFractions', arrayMapper(SupplyFractionDTOUpdate.fromJSON)),
        accessor.getOptional('employeesFractions', arrayMapper(EmployeesFractionDTOUpdate.fromJSON)),
      )
  );



}