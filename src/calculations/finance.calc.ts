import { none, Option, some } from './option';

import { CompanyFacts } from '../models/company.facts';
import deepFreeze from 'deep-freeze';

export interface FinanceCalcResults {
  sumOfFinancialAspects: number;
  economicRatio: number;
  economicRatioE22: number;
  companyIsActiveInFinancialServices: boolean;
}

export const INDUSTRY_CODE_FOR_FINANCIAL_SERVICES = 'K';
export const DEFAULT_SUPPLY_ECONOMIC_RATIO = 0.3;
export const DEFAULT_SUPPLY_ECONOMIC_RATIO_E22 = 0.2;
export function makeFinanceCalc() {
  function calculate(companyFacts: CompanyFacts): FinanceCalcResults {
    const sumOfFinancialAspects = getSumOfFinancialAspects(companyFacts);
    const economicRatio = calculateEconomicRatio(companyFacts).getOrElse(
      DEFAULT_SUPPLY_ECONOMIC_RATIO
    );
    const economicRatioE22 = calculateEconomicRatioE22(companyFacts).getOrElse(
      DEFAULT_SUPPLY_ECONOMIC_RATIO_E22
    );
    return {
      sumOfFinancialAspects,
      economicRatio,
      companyIsActiveInFinancialServices:
        checkCompanysActivityInFinancialServices(companyFacts),
      economicRatioE22,
    };
  }

  function checkCompanysActivityInFinancialServices(
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
  function getSumOfFinancialAspects(companyFacts: CompanyFacts): number {
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
  function calculateEconomicRatio(companyFacts: CompanyFacts): Option<number> {
    return companyFacts.totalAssets === 0
      ? none()
      : some(companyFacts.turnover / companyFacts.totalAssets);
  }

  // In Excel Weight.E22
  function calculateEconomicRatioE22(
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

  return deepFreeze({
    calculate,
  });
}
