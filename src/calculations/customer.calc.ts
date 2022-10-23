import { IndustryProvider } from '../providers/industry.provider';
import { CompanyFacts } from '../models/company.facts';

export interface CustomerCalcResults {
  sumOfEcologicalDesignOfProductsAndService: number;
}

export class CustomerCalc {
  constructor(private readonly industryProvider: IndustryProvider) {}

  public calculate(companyFacts: CompanyFacts): CustomerCalcResults {
    const sumOfEcologicalDesignOfProductsAndService =
      this.calcSumOfEcologicalDesignOfProductsAndService(companyFacts);
    return {
      sumOfEcologicalDesignOfProductsAndService,
    };
  }

  /**
   * In excel this is equal to the cell $'10. Industry'.J38
   * @param companyFacts
   * @private
   */
  private calcSumOfEcologicalDesignOfProductsAndService(
    companyFacts: CompanyFacts
  ) {
    let result = 0;
    let sumAmountOfTotalTurnover = 0;
    for (const industrySector of companyFacts.industrySectors) {
      const industry = this.industryProvider.getOrFail(
        industrySector.industryCode
      );
      result +=
        industry.ecologicalDesignOfProductsAndServices *
        industrySector.amountOfTotalTurnover;
      sumAmountOfTotalTurnover += industrySector.amountOfTotalTurnover;
    }
    return result + (1 - sumAmountOfTotalTurnover);
  }
}
