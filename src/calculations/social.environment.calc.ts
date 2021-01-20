import {CompanyFacts} from "../entities/companyFacts";
import {IndustryProvider} from "../providers/industry.provider";
import {none, Option, some} from "./option";

export interface SocialEnvironmentCalcResults {
  profitInPercentOfTotalSales: Option<number>,
}

export class SocialEnvironmentCalc {

  constructor() {
  }

  public calculate(companyFacts: CompanyFacts): SocialEnvironmentCalcResults  {
    return {profitInPercentOfTotalSales: this.calcProfitInPercentOfTotalSales(companyFacts)};
  }

  private calcProfitInPercentOfTotalSales(companyFacts: CompanyFacts): Option<number> {
    return companyFacts.totalSales === 0 ? none() : some(companyFacts.profit / companyFacts.totalSales);
  }
}