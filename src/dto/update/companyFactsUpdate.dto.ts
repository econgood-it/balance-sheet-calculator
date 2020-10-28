import { strictObjectMapper, expectNumber, arrayMapper } from '@daniel-faber/json-ts';
import { SupplyFractionDTOUpdate } from './supplyFractionUpdate.dto';
import { EmployeesFractionDTOUpdate } from './employeesFractionUpdate.dto';
import {
  IsOptional,
  IsNumber,
  Min,
  ValidateNested
} from 'class-validator';


export class CompanyFactsDTOUpdate {

  @IsOptional()
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly totalPurchaseFromSuppliers?: number;

  @IsOptional()
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly totalStaffCosts?: number;
  @IsOptional()
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly profit?: number;
  @IsOptional()
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly financialCosts?: number;
  @IsOptional()
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly incomeFromFinancialInvestments?: number;
  @IsOptional()
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly additionsToFixedAssets?: number;
  @IsOptional()
  @ValidateNested()
  public readonly supplyFractions?: SupplyFractionDTOUpdate[];
  @IsOptional()
  @ValidateNested()
  public readonly employeesFractions?: EmployeesFractionDTOUpdate[];

  public constructor(
    totalPurchaseFromSuppliers?: number,
    totalStaffCosts?: number,
    profit?: number,
    financialCosts?: number,
    incomeFromFinancialInvestments?: number,
    additionsToFixedAssets?: number,
    supplyFractions?: SupplyFractionDTOUpdate[],
    employeesFractions?: EmployeesFractionDTOUpdate[]
  ) {
    this.totalPurchaseFromSuppliers = totalPurchaseFromSuppliers;
    this.totalStaffCosts = totalStaffCosts;
    this.profit = profit;
    this.financialCosts = financialCosts;
    this.incomeFromFinancialInvestments = incomeFromFinancialInvestments;
    this.additionsToFixedAssets = additionsToFixedAssets;
    this.supplyFractions = supplyFractions;
    this.employeesFractions = employeesFractions;
  }

  public static readonly fromJSON = strictObjectMapper(
    accessor =>
      new CompanyFactsDTOUpdate(
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