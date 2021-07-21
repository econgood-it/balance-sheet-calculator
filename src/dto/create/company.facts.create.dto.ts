import {
  strictObjectMapper,
  expectNumber,
  arrayMapper,
  expectBoolean,
} from '@daniel-faber/json-ts';
import { SupplyFractionDTOCreate } from './supply.fraction.create.dto';
import { EmployeesFractionDTOCreate } from './employees.fraction.create.dto';
import { CompanyFacts } from '../../entities/companyFacts';
import { IsBoolean, IsNumber, Min, ValidateNested } from 'class-validator';
import { IndustrySectorCreateDtoCreate } from './industry.sector.create.dto';
import { Translations } from '../../entities/Translations';

export class CompanyFactsDTOCreate {
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly totalPurchaseFromSuppliers: number;

  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly totalStaffCosts: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly profit: number;

  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly financialCosts: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly incomeFromFinancialInvestments: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly additionsToFixedAssets: number;

  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly turnover: number;

  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly totalAssets: number;

  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly financialAssetsAndCashBalance: number;

  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly numberOfEmployees: number;

  @IsBoolean()
  public readonly hasCanteen: boolean;

  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly averageJourneyToWorkForStaffInKm;

  @IsBoolean()
  public readonly isB2B: boolean;

  @ValidateNested()
  public readonly supplyFractions: SupplyFractionDTOCreate[];

  @ValidateNested()
  public readonly employeesFractions: EmployeesFractionDTOCreate[];

  @ValidateNested()
  public readonly industrySectors: IndustrySectorCreateDtoCreate[];

  public constructor(
    totalPurchaseFromSuppliers: number,
    totalStaffCosts: number,
    profit: number,
    financialCosts: number,
    incomeFromFinancialInvestments: number,
    additionsToFixedAssets: number,
    turnover: number,
    totalAssets: number,
    financialAssetsAndCashBalance: number,
    numberOfEmployees: number,
    hasCanteen: boolean,
    averageJourneyToWorkForStaffInKm: number,
    isB2B: boolean,
    supplyFractions: SupplyFractionDTOCreate[],
    employeesFractions: EmployeesFractionDTOCreate[],
    industrySectors: IndustrySectorCreateDtoCreate[]
  ) {
    this.totalPurchaseFromSuppliers = totalPurchaseFromSuppliers;
    this.totalStaffCosts = totalStaffCosts;
    this.profit = profit;
    this.financialCosts = financialCosts;
    this.incomeFromFinancialInvestments = incomeFromFinancialInvestments;
    this.additionsToFixedAssets = additionsToFixedAssets;
    this.turnover = turnover;
    this.totalAssets = totalAssets;
    this.supplyFractions = supplyFractions;
    this.employeesFractions = employeesFractions;
    this.industrySectors = industrySectors;
    this.financialAssetsAndCashBalance = financialAssetsAndCashBalance;
    this.numberOfEmployees = numberOfEmployees;
    this.hasCanteen = hasCanteen;
    this.averageJourneyToWorkForStaffInKm = averageJourneyToWorkForStaffInKm;
    this.isB2B = isB2B;
  }

  public static readonly fromJSON = strictObjectMapper(
    (accessor) =>
      new CompanyFactsDTOCreate(
        accessor.getOptional('totalPurchaseFromSuppliers', expectNumber, 0),
        accessor.getOptional('totalStaffCosts', expectNumber, 0),
        accessor.getOptional('profit', expectNumber, 0),
        accessor.getOptional('financialCosts', expectNumber, 0),
        accessor.getOptional('incomeFromFinancialInvestments', expectNumber, 0),
        accessor.getOptional('additionsToFixedAssets', expectNumber, 0),
        accessor.getOptional('turnover', expectNumber, 0),
        accessor.getOptional('totalAssets', expectNumber, 0),
        accessor.getOptional('financialAssetsAndCashBalance', expectNumber, 0),
        accessor.getOptional('numberOfEmployees', expectNumber, 0),
        accessor.getOptional('hasCanteen', expectBoolean, false),
        accessor.getOptional(
          'averageJourneyToWorkForStaffInKm',
          expectNumber,
          0
        ),
        accessor.getOptional('isB2B', expectBoolean, false),
        accessor.getOptional(
          'supplyFractions',
          arrayMapper(SupplyFractionDTOCreate.fromJSON),
          []
        ),
        accessor.getOptional(
          'employeesFractions',
          arrayMapper(EmployeesFractionDTOCreate.fromJSON),
          []
        ),
        accessor.getOptional(
          'industrySectors',
          arrayMapper(IndustrySectorCreateDtoCreate.fromJSON),
          []
        )
      )
  );

  public toCompanyFacts(language: keyof Translations): CompanyFacts {
    return new CompanyFacts(
      undefined,
      this.totalPurchaseFromSuppliers,
      this.totalStaffCosts,
      this.profit,
      this.financialCosts,
      this.incomeFromFinancialInvestments,
      this.additionsToFixedAssets,
      this.turnover,
      this.totalAssets,
      this.financialAssetsAndCashBalance,
      this.numberOfEmployees,
      this.hasCanteen,
      this.averageJourneyToWorkForStaffInKm,
      this.isB2B,
      this.supplyFractions.map((sf) => sf.toSupplyFraction()),
      this.employeesFractions.map((ef) => ef.toEmployeesFraction()),
      this.industrySectors.map((is) => is.toIndustrySector(language))
    );
  }
}
