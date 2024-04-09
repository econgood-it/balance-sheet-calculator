import { none, Option, some } from './option';
import {
  OldCompanyFacts,
  INDUSTRY_CODE_FOR_FINANCIAL_SERVICES,
} from '../models/oldCompanyFacts';

export interface FinanceCalcResults {
  sumOfFinancialAspects: number;
  economicRatio: number;
  economicRatioE22: number;
  companyIsActiveInFinancialServices: boolean;
}

export class OldFinanceCalc {
  public static readonly DEFAULT_SUPPLY_ECONOMIC_RATIO = 0.3;
  public static readonly DEFAULT_SUPPLY_ECONOMIC_RATIO_E22 = 0.2;

  public calculate(companyFacts: OldCompanyFacts): FinanceCalcResults {
    const sumOfFinancialAspects = this.getSumOfFinancialAspects(companyFacts);
    const economicRatio = this.calculateEconomicRatio(companyFacts).getOrElse(
      OldFinanceCalc.DEFAULT_SUPPLY_ECONOMIC_RATIO
    );
    const economicRatioE22 = this.calculateEconomicRatioE22(
      companyFacts
    ).getOrElse(OldFinanceCalc.DEFAULT_SUPPLY_ECONOMIC_RATIO_E22);
    return {
      sumOfFinancialAspects,
      economicRatio,
      companyIsActiveInFinancialServices:
        this.checkCompanysActivityInFinancialServices(companyFacts),
      economicRatioE22,
    };
  }

  private checkCompanysActivityInFinancialServices(
    companyFacts: OldCompanyFacts
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
  private getSumOfFinancialAspects(companyFacts: OldCompanyFacts): number {
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
  private calculateEconomicRatio(
    companyFacts: OldCompanyFacts
  ): Option<number> {
    return companyFacts.totalAssets === 0
      ? none()
      : some(companyFacts.turnover / companyFacts.totalAssets);
  }

  // In Excel Weight.E22
  private calculateEconomicRatioE22(
    companyFacts: OldCompanyFacts
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
