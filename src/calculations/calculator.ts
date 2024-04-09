import { SupplierCalc, SupplyCalcResults } from './supplier.calc';
import { OldEmployeesCalc, EmployeesCalcResults } from './old.employees.calc';
import { FinanceCalc, FinanceCalcResults } from './finance.calc';
import { RegionProvider } from '../providers/region.provider';
import { IndustryProvider } from '../providers/industry.provider';
import { OldCustomerCalc, CustomerCalcResults } from './old.customer.calc';
import {
  SocialEnvironmentCalc,
  SocialEnvironmentCalcResults,
} from './social.environment.calc';
import { OldCompanyFacts } from '../models/oldCompanyFacts';
import { isTopic, OldRating } from '../models/oldRating';

export interface CalcResults {
  supplyCalcResults: SupplyCalcResults;
  financeCalcResults: FinanceCalcResults;
  employeesCalcResults: EmployeesCalcResults;
  customerCalcResults: CustomerCalcResults;
  socialEnvironmentCalcResults: SocialEnvironmentCalcResults;
}

export class Calculator {
  public readonly supplierCalc: SupplierCalc;
  public readonly employeesCalc: OldEmployeesCalc;
  public readonly financeCalc: FinanceCalc;
  public readonly customerCalc: OldCustomerCalc;
  public readonly socialEnvironmentCalc: SocialEnvironmentCalc;

  constructor(
    regionProvider: RegionProvider,
    industryProvider: IndustryProvider
  ) {
    this.supplierCalc = new SupplierCalc(regionProvider, industryProvider);
    this.employeesCalc = new OldEmployeesCalc(regionProvider);
    this.financeCalc = new FinanceCalc();
    this.customerCalc = new OldCustomerCalc(industryProvider);
    this.socialEnvironmentCalc = new SocialEnvironmentCalc();
  }

  public async calculate(companyFacts: OldCompanyFacts): Promise<CalcResults> {
    return {
      supplyCalcResults: this.supplierCalc.calculate(companyFacts),
      financeCalcResults: this.financeCalc.calculate(companyFacts),
      employeesCalcResults: this.employeesCalc.calculate(companyFacts),
      customerCalcResults: this.customerCalc.calculate(companyFacts),
      socialEnvironmentCalcResults:
        this.socialEnvironmentCalc.calculate(companyFacts),
    };
  }
}

const MAX_NEGATIVE_POINTS = -3600;

export function calculateTotalPoints(ratings: OldRating[]): number {
  const sum = ratings
    .filter((r) => isTopic(r))
    .reduce((sum, currentRating) => sum + currentRating.points, 0);
  return sum < MAX_NEGATIVE_POINTS ? MAX_NEGATIVE_POINTS : sum;
}
