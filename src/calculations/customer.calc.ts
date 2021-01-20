import {CompanyFacts} from "../entities/companyFacts";
import {Region} from "../entities/region";
import {SupplyFraction} from "../entities/supplyFraction";
import {Industry} from "../entities/industry";
import {IndustryProvider} from "../providers/industry.provider";

export interface CustomerCalcResults {
  sumOfEcologicalDesignOfProductsAndService: number,
}

export class CustomerCalc {

  constructor(private readonly industryProvider: IndustryProvider) {
  }

  public calculate(companyFacts: CompanyFacts): CustomerCalcResults  {
    const sumOfEcologicalDesignOfProductsAndService = this.calcSumOfEcologicalDesignOfProductsAndService(companyFacts);
    return {sumOfEcologicalDesignOfProductsAndService: sumOfEcologicalDesignOfProductsAndService};
  }

  private calcSumOfEcologicalDesignOfProductsAndService(companyFacts: CompanyFacts) {
    let result = 0;
    for (const industrySector of companyFacts.industrySectors) {
      const industry = this.industryProvider.getOrFail(industrySector.industryCode);
      result += industry.ecologicalDesignOfProductsAndServices * industrySector.amountOfTotalTurnover;
    }
    return result;
  }

}