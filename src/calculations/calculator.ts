import { CompanyFacts } from '../entities/companyFacts';
import { SupplierCalc, SupplyCalcResults } from './supplier.calc';
import { EmployeesCalc, EmployeesCalcResults } from './employees.calc';
import { FinanceCalc, FinanceCalcResults } from './finance.calc';
import { RegionProvider } from '../providers/region.provider';
import { IndustryProvider } from '../providers/industry.provider';
import { CustomerCalc, CustomerCalcResults } from './customer.calc';
import {
  SocialEnvironmentCalc,
  SocialEnvironmentCalcResults,
} from './social.environment.calc';

export interface CalcResults {
  supplyCalcResults: SupplyCalcResults;
  financeCalcResults: FinanceCalcResults;
  employeesCalcResults: EmployeesCalcResults;
  customerCalcResults: CustomerCalcResults;
  socialEnvironmentCalcResults: SocialEnvironmentCalcResults;
}

export class Calculator {
  public readonly supplierCalc: SupplierCalc;
  public readonly employeesCalc: EmployeesCalc;
  public readonly financeCalc: FinanceCalc;
  public readonly customerCalc: CustomerCalc;
  public readonly socialEnvironmentCalc: SocialEnvironmentCalc;

  constructor(
    regionProvider: RegionProvider,
    industryProvider: IndustryProvider
  ) {
    this.supplierCalc = new SupplierCalc(regionProvider, industryProvider);
    this.employeesCalc = new EmployeesCalc(regionProvider);
    this.financeCalc = new FinanceCalc();
    this.customerCalc = new CustomerCalc(industryProvider);
    this.socialEnvironmentCalc = new SocialEnvironmentCalc();
  }

  public async calculate(companyFacts: CompanyFacts): Promise<CalcResults> {
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
