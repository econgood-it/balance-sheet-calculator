import {
  strictObjectMapper,
  expectNumber,
  arrayMapper,
  expectBoolean,
  expectString,
} from '@daniel-faber/json-ts';
import { SupplyFractionDTOUpdate } from './supply.fraction.update.dto';
import { EmployeesFractionDTOUpdate } from './employees.fraction.update.dto';
import {
  IsOptional,
  IsNumber,
  Min,
  ValidateNested,
  IsBoolean,
  IsString,
} from 'class-validator';
import { IndustrySectorDtoUpdate } from './industry.sector.update.dto';
import { DEFAULT_COUNTRY_CODE } from '../../entities/region';

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
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly profit?: number;

  @IsOptional()
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly financialCosts?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly incomeFromFinancialInvestments?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly additionsToFixedAssets?: number;

  @IsOptional()
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly turnover?: number;

  @IsOptional()
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly totalAssets?: number;

  @IsOptional()
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly financialAssetsAndCashBalance?: number;

  @IsOptional()
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly numberOfEmployees?: number;

  @IsOptional()
  @IsBoolean()
  public readonly hasCanteen?: boolean;

  @IsOptional()
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly averageJourneyToWorkForStaffInKm?: number;

  @IsOptional()
  @IsBoolean()
  public readonly isB2B?: boolean;

  @IsOptional()
  @ValidateNested()
  public readonly supplyFractions?: SupplyFractionDTOUpdate[];

  @IsOptional()
  @ValidateNested()
  public readonly employeesFractions?: EmployeesFractionDTOUpdate[];

  @IsOptional()
  @ValidateNested()
  public readonly industrySectors?: IndustrySectorDtoUpdate[];

  @IsOptional()
  @IsString()
  public readonly mainOriginOfOtherSuppliers?: string;

  public constructor(
    totalPurchaseFromSuppliers?: number,
    totalStaffCosts?: number,
    profit?: number,
    financialCosts?: number,
    incomeFromFinancialInvestments?: number,
    additionsToFixedAssets?: number,
    turnover?: number,
    totalAssets?: number,
    financialAssetsAndCashBalance?: number,
    numberOfEmployees?: number,
    hasCanteen?: boolean,
    averageJourneyToWorkForStaffInKm?: number,
    isB2B?: boolean,
    supplyFractions?: SupplyFractionDTOUpdate[],
    employeesFractions?: EmployeesFractionDTOUpdate[],
    industrySectors?: IndustrySectorDtoUpdate[],
    mainOriginOfOtherSuppliers?: string
  ) {
    this.totalPurchaseFromSuppliers = totalPurchaseFromSuppliers;
    this.totalStaffCosts = totalStaffCosts;
    this.profit = profit;
    this.financialCosts = financialCosts;
    this.incomeFromFinancialInvestments = incomeFromFinancialInvestments;
    this.additionsToFixedAssets = additionsToFixedAssets;
    this.turnover = turnover;
    this.totalAssets = totalAssets;
    this.financialAssetsAndCashBalance = financialAssetsAndCashBalance;
    this.numberOfEmployees = numberOfEmployees;
    this.supplyFractions = supplyFractions;
    this.employeesFractions = employeesFractions;
    this.industrySectors = industrySectors;
    this.hasCanteen = hasCanteen;
    this.averageJourneyToWorkForStaffInKm = averageJourneyToWorkForStaffInKm;
    this.isB2B = isB2B;
    this.mainOriginOfOtherSuppliers = mainOriginOfOtherSuppliers;
  }

  public static readonly fromJSON = strictObjectMapper(
    (accessor) =>
      new CompanyFactsDTOUpdate(
        accessor.getOptional('totalPurchaseFromSuppliers', expectNumber),
        accessor.getOptional('totalStaffCosts', expectNumber),
        accessor.getOptional('profit', expectNumber),
        accessor.getOptional('financialCosts', expectNumber),
        accessor.getOptional('incomeFromFinancialInvestments', expectNumber),
        accessor.getOptional('additionsToFixedAssets', expectNumber),
        accessor.getOptional('turnover', expectNumber),
        accessor.getOptional('totalAssets', expectNumber),
        accessor.getOptional('financialAssetsAndCashBalance', expectNumber),
        accessor.getOptional('numberOfEmployees', expectNumber),
        accessor.getOptional('hasCanteen', expectBoolean),
        accessor.getOptional('averageJourneyToWorkForStaffInKm', expectNumber),
        accessor.getOptional('isB2B', expectBoolean),
        accessor.getOptional(
          'supplyFractions',
          arrayMapper(SupplyFractionDTOUpdate.fromJSON)
        ),
        accessor.getOptional(
          'employeesFractions',
          arrayMapper(EmployeesFractionDTOUpdate.fromJSON)
        ),
        accessor.getOptional(
          'industrySectors',
          arrayMapper(IndustrySectorDtoUpdate.fromJSON)
        ),
        accessor.getOptional(
          'mainOriginOfOtherSuppliers',
          expectString,
          DEFAULT_COUNTRY_CODE
        )
      )
  );
}
