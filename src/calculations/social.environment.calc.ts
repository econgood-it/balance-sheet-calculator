import {CompanyFacts} from "../entities/companyFacts";
import {IndustryProvider} from "../providers/industry.provider";
import {none, Option, some} from "./option";

export interface SocialEnvironmentCalcResults {
  profitInPercentOfTotalSales: Option<number>,
  companyIsActiveInMiningOrConstructionIndustry: boolean
}

export class SocialEnvironmentCalc {

  public static readonly INDUSTRY_CODE_FOR_MINING = 'B';
  public static readonly INDUSTRY_CODE_FOR_CONSTRUCTION_INDUSTRY = 'F';

  constructor() {
  }

  public calculate(companyFacts: CompanyFacts): SocialEnvironmentCalcResults  {
    return {
      profitInPercentOfTotalSales: this.calcProfitInPercentOfTotalSales(companyFacts),
      companyIsActiveInMiningOrConstructionIndustry: this.checkCompanysActivityInMiningOrConstructionIndustry(companyFacts)
    };
  }

  private calcProfitInPercentOfTotalSales(companyFacts: CompanyFacts): Option<number> {
    return companyFacts.totalSales === 0 ? none() : some(companyFacts.profit / companyFacts.totalSales);
  }

  private checkCompanysActivityInMiningOrConstructionIndustry(companyFacts: CompanyFacts): boolean {
    return companyFacts.industrySectors.some(is => is.industryCode == SocialEnvironmentCalc.INDUSTRY_CODE_FOR_MINING ||
      is.industryCode == SocialEnvironmentCalc.INDUSTRY_CODE_FOR_CONSTRUCTION_INDUSTRY);
  }
}