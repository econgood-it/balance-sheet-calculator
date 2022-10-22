import { none, Option, some } from './option';
import {
  CompanyFacts,
  INDUSTRY_CODE_FOR_CONSTRUCTION_INDUSTRY,
  INDUSTRY_CODE_FOR_MINING,
} from '../models/balance.sheet';

export interface SocialEnvironmentCalcResults {
  profitInPercentOfTurnover: Option<number>;
  companyIsActiveInMiningOrConstructionIndustry: boolean;
}

export class SocialEnvironmentCalc {
  public calculate(companyFacts: CompanyFacts): SocialEnvironmentCalcResults {
    return {
      profitInPercentOfTurnover:
        this.calcProfitInPercentOfTotalSales(companyFacts),
      companyIsActiveInMiningOrConstructionIndustry:
        this.checkCompanysActivityInMiningOrConstructionIndustry(companyFacts),
    };
  }

  private calcProfitInPercentOfTotalSales(
    companyFacts: CompanyFacts
  ): Option<number> {
    return companyFacts.turnover === 0
      ? none()
      : some(companyFacts.profit / companyFacts.turnover);
  }

  private checkCompanysActivityInMiningOrConstructionIndustry(
    companyFacts: CompanyFacts
  ): boolean {
    return companyFacts.industrySectors.some(
      (is) =>
        is.industryCode === INDUSTRY_CODE_FOR_MINING ||
        is.industryCode === INDUSTRY_CODE_FOR_CONSTRUCTION_INDUSTRY
    );
  }
}
