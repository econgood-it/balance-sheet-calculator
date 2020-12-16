import {CompanyFacts} from "../entities/companyFacts";
import {IndustryProvider} from "../providers/industry.provider";
import {none, Option, some} from "./option";

export interface FinanceCalcResults {
  sumOfFinancialAspects: number,
  economicRatio: number,
  economicRatioE22: number,
  companyIsActiveInFinancialServices: boolean
}

export class FinanceCalc {

  public static readonly INDUSTRY_CODE_FOR_FINANCIAL_SERVICES = 'K';
  public static readonly DEFAULT_SUPPLY_ECONOMIC_RATIO = 0.3;
  public static readonly DEFAULT_SUPPLY_ECONOMIC_RATIO_E22 = 0.2;
  constructor() {
  }

  public calculate(companyFacts: CompanyFacts): FinanceCalcResults  {
    const sumOfFinancialAspects = this.getSumOfFinancialAspects(companyFacts);
    let economicRatio = this.calculateEconomicRatio(companyFacts).getOrElse(FinanceCalc.DEFAULT_SUPPLY_ECONOMIC_RATIO);
    let economicRatioE22 = this.calculateEconomicRatioE22(companyFacts).getOrElse(FinanceCalc.DEFAULT_SUPPLY_ECONOMIC_RATIO_E22);
    return {sumOfFinancialAspects: sumOfFinancialAspects, economicRatio: economicRatio,
      companyIsActiveInFinancialServices: this.checkCompanysActivityInFinancialServices(companyFacts),
      economicRatioE22: economicRatioE22
    };
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
  private calculateEconomicRatio(companyFacts: CompanyFacts): Option<number> {
    return companyFacts.totalAssets == 0 ? none() : some(companyFacts.turnover / companyFacts.totalAssets);
  }

  // In Excel Weight.E22
  private calculateEconomicRatioE22(companyFacts: CompanyFacts): Option<number> {
    return  companyFacts.totalAssets == 0 ? none() :
      some((companyFacts.additionsToFixedAssets + companyFacts.financialAssetsAndCashBalance) / companyFacts.totalAssets);
  }
}