import {CompanyFacts} from "../entities/companyFacts";

export interface FinanceCalcResults {
  sumOfFinancialAspects: number,
  economicRatio: number,
  companyIsActiveInFinancialServices: boolean
}

export class FinanceCalc {

  public static readonly DEFAULT_SUPPLY_ECONOMIC_RATIO = 0.3;
  constructor() {
  }

  public calculate(companyFacts: CompanyFacts): FinanceCalcResults  {
    const sumOfFinancialAspects = this.getSumOfFinancialAspects(companyFacts);
    let economicRatio = this.calculateEconomicRatio(companyFacts);
    economicRatio = Number.isNaN(economicRatio) ? FinanceCalc.DEFAULT_SUPPLY_ECONOMIC_RATIO : economicRatio;
    return {sumOfFinancialAspects: sumOfFinancialAspects, economicRatio: economicRatio};
  }

  // In Excel I19+I21+I22+G24
  public getSumOfFinancialAspects(companyFacts: CompanyFacts): number {
    return companyFacts.profit + companyFacts.financialCosts
      + companyFacts.incomeFromFinancialInvestments + companyFacts.additionsToFixedAssets;
  }

  // In Excel Weight.E23
  public calculateEconomicRatio(companyFacts: CompanyFacts): number {
    return companyFacts.turnover / companyFacts.totalAssets;
  }
}