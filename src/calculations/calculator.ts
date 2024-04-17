import { SupplyCalcResults } from './old.supplier.calc';
import { EmployeesCalcResults } from './old.employees.calc';
import { FinanceCalcResults } from './old.finance.calc';
import { RegionProvider } from '../providers/region.provider';
import { IndustryProvider } from '../providers/industry.provider';
import { CustomerCalcResults } from './old.customer.calc';
import { SocialEnvironmentCalcResults } from './old.social.environment.calc';
import { isTopic, OldRating } from '../models/oldRating';
import { CompanyFacts } from '../models/company.facts';
import { makeSupplierCalc } from './supplier.calc';
import { makeFinanceCalc } from './finance.calc';
import { makeEmployeesCalc } from './employees.calc';
import { makeCustomerCalc } from './customer.calc';
import { makeSocialEnvironmentCalc } from './social.environment.calc';

export interface CalcResults {
  supplyCalcResults: SupplyCalcResults;
  financeCalcResults: FinanceCalcResults;
  employeesCalcResults: EmployeesCalcResults;
  customerCalcResults: CustomerCalcResults;
  socialEnvironmentCalcResults: SocialEnvironmentCalcResults;
}

export async function calculate(
  regionProvider: RegionProvider,
  industryProvider: IndustryProvider,
  companyFacts: CompanyFacts
): Promise<CalcResults> {
  return {
    supplyCalcResults: makeSupplierCalc(
      regionProvider,
      industryProvider
    ).calculate(companyFacts),
    financeCalcResults: makeFinanceCalc().calculate(companyFacts),
    employeesCalcResults:
      makeEmployeesCalc(regionProvider).calculate(companyFacts),
    customerCalcResults:
      makeCustomerCalc(industryProvider).calculate(companyFacts),
    socialEnvironmentCalcResults:
      makeSocialEnvironmentCalc().calculate(companyFacts),
  };
}

const MAX_NEGATIVE_POINTS = -3600;

export function calculateTotalPoints(ratings: OldRating[]): number {
  const sum = ratings
    .filter((r) => isTopic(r))
    .reduce((sum, currentRating) => sum + currentRating.points, 0);
  return sum < MAX_NEGATIVE_POINTS ? MAX_NEGATIVE_POINTS : sum;
}
