import { none, Option, some } from './option';
import {
  OldCompanyFacts,
  INDUSTRY_CODE_FOR_CONSTRUCTION_INDUSTRY,
  INDUSTRY_CODE_FOR_MINING,
} from '../models/oldCompanyFacts';

export interface SocialEnvironmentCalcResults {
  profitInPercentOfTurnover: Option<number>;
  companyIsActiveInMiningOrConstructionIndustry: boolean;
}

export class OldSocialEnvironmentCalc {
  public calculate(
    companyFacts: OldCompanyFacts
  ): SocialEnvironmentCalcResults {
    return {
      profitInPercentOfTurnover:
        this.calcProfitInPercentOfTotalSales(companyFacts),
      companyIsActiveInMiningOrConstructionIndustry:
        this.checkCompanysActivityInMiningOrConstructionIndustry(companyFacts),
    };
  }

  /**
   * In Excel this is equal to the cell $'11.Weighting'.I20
   * @param companyFacts
   * @private
   */
  private calcProfitInPercentOfTotalSales(
    companyFacts: OldCompanyFacts
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
  private checkCompanysActivityInMiningOrConstructionIndustry(
    companyFacts: OldCompanyFacts
  ): boolean {
    return companyFacts.industrySectors.some(
      (is) =>
        is.industryCode === INDUSTRY_CODE_FOR_MINING ||
        is.industryCode === INDUSTRY_CODE_FOR_CONSTRUCTION_INDUSTRY
    );
  }
}
