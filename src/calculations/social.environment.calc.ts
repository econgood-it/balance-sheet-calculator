import { none, Option, some } from './option';

import { CompanyFacts } from '../models/company.facts';
import deepFreeze from 'deep-freeze';

export interface SocialEnvironmentCalcResults {
  profitInPercentOfTurnover: Option<number>;
  companyIsActiveInMiningOrConstructionIndustry: boolean;
}

export function makeSocialEnvironmentCalc() {
  const INDUSTRY_CODE_FOR_MINING = 'B';
  const INDUSTRY_CODE_FOR_CONSTRUCTION_INDUSTRY = 'F';
  function calculate(companyFacts: CompanyFacts): SocialEnvironmentCalcResults {
    return {
      profitInPercentOfTurnover: calcProfitInPercentOfTotalSales(companyFacts),
      companyIsActiveInMiningOrConstructionIndustry:
        checkCompanysActivityInMiningOrConstructionIndustry(companyFacts),
    };
  }

  /**
   * In Excel this is equal to the cell $'11.Weighting'.I20
   * @param companyFacts
   * @private
   */
  function calcProfitInPercentOfTotalSales(
    companyFacts: CompanyFacts
  ): Option<number> {
    return companyFacts.turnover === 0
      ? none()
      : some(companyFacts.profit / companyFacts.turnover);
  }

  /**
   * In Excel this is equal to the cell $'11.Weighting'.H35
   * @param companyFacts
   * @private
   */
  function checkCompanysActivityInMiningOrConstructionIndustry(
    companyFacts: CompanyFacts
  ): boolean {
    return companyFacts.industrySectors.some(
      (is) =>
        is.industryCode === INDUSTRY_CODE_FOR_MINING ||
        is.industryCode === INDUSTRY_CODE_FOR_CONSTRUCTION_INDUSTRY
    );
  }

  return deepFreeze({
    calculate,
  });
}
