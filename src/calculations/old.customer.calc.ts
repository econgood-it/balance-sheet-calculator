import { IndustryProvider } from '../providers/industry.provider';
import { OldCompanyFacts } from '../models/oldCompanyFacts';

export interface CustomerCalcResults {
  sumOfEcologicalDesignOfProductsAndService: number;
}

export class OldCustomerCalc {
  private static readonly DEFAULT_ECOLOGICAL_DESIGN_OF_PRODUCTS: number = 1;
  constructor(private readonly industryProvider: IndustryProvider) {}

  public calculate(companyFacts: OldCompanyFacts): CustomerCalcResults {
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
    companyFacts: OldCompanyFacts
  ) {
    let result = 0;
    let sumAmountOfTotalTurnover = 0;
    for (const industrySector of companyFacts.industrySectors) {
      const ecologicalDesignOfProductsAndServices = industrySector.industryCode
        ? this.industryProvider.getOrFail(industrySector.industryCode)
            .ecologicalDesignOfProductsAndServices
        : OldCustomerCalc.DEFAULT_ECOLOGICAL_DESIGN_OF_PRODUCTS;
      result +=
        ecologicalDesignOfProductsAndServices *
        industrySector.amountOfTotalTurnover;
      sumAmountOfTotalTurnover += industrySector.amountOfTotalTurnover;
    }
    return result + (1 - sumAmountOfTotalTurnover);
  }
}
