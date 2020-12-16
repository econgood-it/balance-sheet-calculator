import {CompanyFacts} from "../entities/companyFacts";
import {IndustryProvider} from "../providers/industry.provider";

export interface FinanceCalcResults {
  sumOfFinancialAspects: number,
  economicRatio: number,
  companyIsActiveInFinancialServices: boolean
}

export class FinanceCalc {

  public static readonly INDUSTRY_CODE_FOR_FINANCIAL_SERVICES = 'K';
  public static readonly DEFAULT_SUPPLY_ECONOMIC_RATIO = 0.3;
  constructor() {
  }

  public calculate(companyFacts: CompanyFacts): FinanceCalcResults  {
    const sumOfFinancialAspects = this.getSumOfFinancialAspects(companyFacts);
    let economicRatio = this.calculateEconomicRatio(companyFacts);
    economicRatio = Number.isNaN(economicRatio) ? FinanceCalc.DEFAULT_SUPPLY_ECONOMIC_RATIO : economicRatio;
    return {sumOfFinancialAspects: sumOfFinancialAspects, economicRatio: economicRatio,
      companyIsActiveInFinancialServices: this.checkCompanysActivityInFinancialServices(companyFacts)};
  }

  private checkCompanysActivityInFinancialServices(companyFacts: CompanyFacts): boolean {
    return companyFacts.industrySectors.some(is => is.industryCode == FinanceCalc.INDUSTRY_CODE_FOR_FINANCIAL_SERVICES);
  }

  // In Excel I19+I21+I22+G24
  private getSumOfFinancialAspects(companyFacts: CompanyFacts): number {
    return companyFacts.profit + companyFacts.financialCosts
      + companyFacts.incomeFromFinancialInvestments + companyFacts.additionsToFixedAssets;
  }

  // In Excel Weight.E23
  private calculateEconomicRatio(companyFacts: CompanyFacts): number {
    return companyFacts.turnover / companyFacts.totalAssets;
  }
}