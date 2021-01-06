import {strictObjectMapper, expectNumber, arrayMapper, expectBoolean} from '@daniel-faber/json-ts';
import { SupplyFractionDTOCreate } from './supply.fraction.create.dto';
import { EmployeesFractionDTOCreate } from './employees.fraction.create.dto';
import { CompanyFacts } from '../../entities/companyFacts';
import {IsBoolean, IsNumber, Min, ValidateNested} from "class-validator";
import {IndustrySectorCreateDtoCreate} from "./industry.sector.create.dto";

export class CompanyFactsDTOCreate {
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly totalPurchaseFromSuppliers: number;
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly totalStaffCosts: number;
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly profit: number
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly financialCosts: number
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly incomeFromFinancialInvestments: number;
  @Min(0)
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
  public readonly totalSales: number;
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly numberOfEmployees: number;
  @IsBoolean()
  public readonly hasCanteen: boolean;
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly averageJourneyToWorkForStaffInKm;
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
    totalSales: number,
    numberOfEmployees: number,
    hasCanteen: boolean,
    averageJourneyToWorkForStaffInKm: number,
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
    this.totalSales = totalSales;
    this.numberOfEmployees = numberOfEmployees;
    this.hasCanteen = hasCanteen;
    this.averageJourneyToWorkForStaffInKm = averageJourneyToWorkForStaffInKm;
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
        accessor.get('turnover', expectNumber),
        accessor.get('totalAssets', expectNumber),
        accessor.get('financialAssetsAndCashBalance', expectNumber),
        accessor.get('totalSales', expectNumber),
        accessor.get('numberOfEmployees', expectNumber),
        accessor.get('hasCanteen', expectBoolean),
        accessor.get('averageJourneyToWorkForStaffInKm', expectNumber),
        accessor.get('supplyFractions', arrayMapper(SupplyFractionDTOCreate.fromJSON)),
        accessor.get('employeesFractions', arrayMapper(EmployeesFractionDTOCreate.fromJSON)),
        accessor.get('industrySectors', arrayMapper(IndustrySectorCreateDtoCreate.fromJSON))
      )
  );

  public toCompanyFacts(): CompanyFacts {
    return new CompanyFacts(undefined, this.totalPurchaseFromSuppliers, this.totalStaffCosts,
      this.profit, this.financialCosts, this.incomeFromFinancialInvestments, this.additionsToFixedAssets, this.turnover,
      this.totalAssets, this.financialAssetsAndCashBalance, this.totalSales,
      this.numberOfEmployees, this.hasCanteen, this.averageJourneyToWorkForStaffInKm,
      this.supplyFractions.map(sf => sf.toSupplyFraction()),
      this.employeesFractions.map(ef => ef.toEmployeesFraction()), this.industrySectors.map(is => is.toIndustrySector()));
  }
}
