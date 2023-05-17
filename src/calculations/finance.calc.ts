import { none, Option, some } from './option';
import {
  CompanyFacts,
  INDUSTRY_CODE_FOR_FINANCIAL_SERVICES,
} from '../models/company.facts';

export interface FinanceCalcResults {
  sumOfFinancialAspects: number;
  economicRatio: number;
  economicRatioE22: number;
  companyIsActiveInFinancialServices: boolean;
}

export class FinanceCalc {
  public static readonly DEFAULT_SUPPLY_ECONOMIC_RATIO = 0.3;
  public static readonly DEFAULT_SUPPLY_ECONOMIC_RATIO_E22 = 0.2;

  public calculate(companyFacts: CompanyFacts): FinanceCalcResults {
    const sumOfFinancialAspects = this.getSumOfFinancialAspects(companyFacts);
    const economicRatio = this.calculateEconomicRatio(companyFacts).getOrElse(
      FinanceCalc.DEFAULT_SUPPLY_ECONOMIC_RATIO
    );
    const economicRatioE22 = this.calculateEconomicRatioE22(
      companyFacts
    ).getOrElse(FinanceCalc.DEFAULT_SUPPLY_ECONOMIC_RATIO_E22);
    return {
      sumOfFinancialAspects,
      economicRatio,
      companyIsActiveInFinancialServices:
        this.checkCompanysActivityInFinancialServices(companyFacts),
      economicRatioE22,
    };
  }

  private checkCompanysActivityInFinancialServices(
    companyFacts: CompanyFacts
  ): boolean {
    return companyFacts.industrySectors.some(
      (is) => is.industryCode === INDUSTRY_CODE_FOR_FINANCIAL_SERVICES
    );
  }

  /**
   * In Excel $'11.Region' I19+I21+I22+G24
   * @param companyFacts
   * @private
   */
  private getSumOfFinancialAspects(companyFacts: CompanyFacts): number {
    return (
      companyFacts.profit +
      companyFacts.financialCosts +
      companyFacts.incomeFromFinancialInvestments +
      companyFacts.additionsToFixedAssets
    );
  }

  /**
   * In Excel Weight.E23
   * @param companyFacts
   * @private
   */
  private calculateEconomicRatio(companyFacts: CompanyFacts): Option<number> {
    return companyFacts.totalAssets === 0
      ? none()
      : some(companyFacts.turnover / companyFacts.totalAssets);
  }

  // In Excel Weight.E22
  private calculateEconomicRatioE22(
    companyFacts: CompanyFacts
  ): Option<number> {
    return companyFacts.totalAssets === 0
      ? none()
      : some(
          (companyFacts.additionsToFixedAssets +
            companyFacts.financialAssetsAndCashBalance) /
            companyFacts.totalAssets
        );
  }
}
