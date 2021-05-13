import { CompanyFacts } from '../entities/companyFacts';
import { none, Option, some } from './option';

export interface SocialEnvironmentCalcResults {
  profitInPercentOfTurnover: Option<number>;
  companyIsActiveInMiningOrConstructionIndustry: boolean;
}

export class SocialEnvironmentCalc {
  public static readonly INDUSTRY_CODE_FOR_MINING = 'B';
  public static readonly INDUSTRY_CODE_FOR_CONSTRUCTION_INDUSTRY = 'F';

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
        is.industryCode === SocialEnvironmentCalc.INDUSTRY_CODE_FOR_MINING ||
        is.industryCode ===
          SocialEnvironmentCalc.INDUSTRY_CODE_FOR_CONSTRUCTION_INDUSTRY
    );
  }
}
