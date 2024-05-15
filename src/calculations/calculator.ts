import { RegionProvider } from '../providers/region.provider';
import { IndustryProvider } from '../providers/industry.provider';

import { CompanyFacts } from '../models/company.facts';
import { makeSupplierCalc, SupplyCalcResults } from './supplier.calc';
import { FinanceCalcResults, makeFinanceCalc } from './finance.calc';
import { EmployeesCalcResults, makeEmployeesCalc } from './employees.calc';
import { CustomerCalcResults, makeCustomerCalc } from './customer.calc';
import {
  makeSocialEnvironmentCalc,
  SocialEnvironmentCalcResults,
} from './social.environment.calc';

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
