import { CalcResults } from './calculator';
import { CompanyFacts } from '../entities/companyFacts';
import { CompanySize } from './employees.calc';
import Provider from '../providers/provider';

export class TopicWeightCalculator {
  public calcTopicWeights(
    calcResults: CalcResults,
    companyFacts: CompanyFacts
  ): Provider<string, number> {
    const topicWeights = new Provider<string, number>([
      ['A1', this.constantWeight()],
      ['A2', this.constantWeight()],
      ['A3', this.calculateTopicWeightOfA3(calcResults)],
      ['A4', this.calculateTopicWeightOfA4(calcResults)],
      ['B1', this.calculateTopicWeightOfB1(calcResults)],
      ['B2', this.calculateTopicWeightOfB2(calcResults)],
      ['B3', this.calculateTopicWeightOfB3(calcResults)],
      ['B4', this.calculateTopicWeightOfB4(calcResults)],
      ['C1', this.constantWeight()],
      ['C2', this.constantWeight()],
      ['C3', this.calculateTopicWeightOfC3(companyFacts)],
      ['C4', this.calculateTopicWeightOfC4(calcResults, companyFacts)],
      ['D1', this.constantWeight()],
      ['D2', this.constantWeight()],
      ['D3', this.calculateTopicWeightOfD3AndE3(calcResults)],
      ['D4', this.calculateTopicWeightOfD4(companyFacts)],
      ['E1', this.constantWeight()],
      ['E2', this.calculateTopicWeightOfE2(calcResults)],
      ['E3', this.calculateTopicWeightOfD3AndE3(calcResults)],
      ['E4', this.calculateTopicWeightOfE4(calcResults)],
    ]);
    if (companyFacts.allValuesAreZero()) {
      const allTopicWeightsAreOne = new Provider<string, number>();
      for (const [key] of topicWeights) {
        allTopicWeightsAreOne.set(key, 1);
      }
      return allTopicWeightsAreOne;
    }
    return topicWeights;
  }

  public constantWeight(): number {
    return 1.0;
  }

  public calculateTopicWeightOfA3(calcResults: CalcResults): number {
    if (calcResults.supplyCalcResults.supplyChainWeight > 1.5) {
      return 2;
    } else if (calcResults.supplyCalcResults.supplyChainWeight > 1.25) {
      return 1.5;
    } else if (calcResults.supplyCalcResults.supplyChainWeight < 0.75) {
      return 0.5;
    } else {
      return 1;
    }
  }

  /**
   * In excel this is equal to the cell $'9.Weighting'.P16
   * Excel formula is:
   * =IF(G69="empty",1,IF($'11.Region'.I9<1.5,$'3. Calc'.C105,IF($'11.Region'.I9<3.26,$'3. Calc'.C104,IF($'11.Region'.I9<4.5,$'3. Calc'.C103,$'3. Calc'.C102))))
   * @param calcResults
   */
  public calculateTopicWeightOfA4(calcResults: CalcResults): number {
    if (calcResults.supplyCalcResults.itucAverage < 1.5) {
      return 0.5;
    } else if (calcResults.supplyCalcResults.itucAverage < 3.26) {
      return 1;
    } else if (calcResults.supplyCalcResults.itucAverage < 4.5) {
      return 1.5;
    } else {
      return 2;
    }
  }

  public calculateTopicWeightOfB1(calcResults: CalcResults): number {
    if (calcResults.financeCalcResults.companyIsActiveInFinancialServices) {
      return 2;
    } else if (calcResults.financeCalcResults.economicRatio < 0.1) {
      return 1.5;
    } else if (calcResults.financeCalcResults.economicRatio > 0.5) {
      return 0.5;
    } else {
      return 1;
    }
  }

  public calculateTopicWeightOfB2(calcResults: CalcResults): number {
    if (
      calcResults.socialEnvironmentCalcResults.profitInPercentOfTurnover.isPresent()
    ) {
      const profitInPercentOfTotalSales =
        calcResults.socialEnvironmentCalcResults.profitInPercentOfTurnover.get() as number;
      if (profitInPercentOfTotalSales > 0.1) {
        return 1.5;
      } else if (profitInPercentOfTotalSales < 0.001) {
        return 0;
      } else if (profitInPercentOfTotalSales < 0.03) {
        return 0.5;
      }
    }
    return 1;
  }

  public calculateTopicWeightOfB3(calcResults: CalcResults): number {
    if (calcResults.financeCalcResults.companyIsActiveInFinancialServices) {
      return 2;
    } else if (calcResults.financeCalcResults.economicRatioE22 < 0.1) {
      return 0.5;
    } else if (calcResults.financeCalcResults.economicRatioE22 > 0.25) {
      return 1.5;
    } else {
      return 1;
    }
  }

  public calculateTopicWeightOfB4(calcResults: CalcResults): number {
    if (calcResults.employeesCalcResults.companySize === CompanySize.micro) {
      return 0.5;
    } else {
      return 1;
    }
  }

  public calculateTopicWeightOfC3(companyFacts: CompanyFacts): number {
    if (
      companyFacts.averageJourneyToWorkForStaffInKm < 10 &&
      !companyFacts.hasCanteen
    ) {
      return 0.5;
    } else if (companyFacts.averageJourneyToWorkForStaffInKm > 25) {
      return 1.5;
    } else {
      return 1;
    }
  }

  public calculateTopicWeightOfC4(
    calcResults: CalcResults,
    companyFacts: CompanyFacts
  ): number {
    if (companyFacts.numberOfEmployees === 1) {
      return 0;
    } else if (
      calcResults.employeesCalcResults.companySize === CompanySize.micro
    ) {
      return 0.5;
    } else if (calcResults.employeesCalcResults.itucAverage > 3.25) {
      return 1.5;
    } else {
      return 1;
    }
  }

  /**
   * In excel this is equal to the cell $'10. Industry'.J39
   * @param calcResults
   */
  public calculateTopicWeightOfD3AndE3(calcResults: CalcResults): number {
    if (
      calcResults.customerCalcResults
        .sumOfEcologicalDesignOfProductsAndService < 0.75
    ) {
      return 0.5;
    } else if (
      calcResults.customerCalcResults
        .sumOfEcologicalDesignOfProductsAndService < 1.25
    ) {
      return 1;
    } else if (
      calcResults.customerCalcResults
        .sumOfEcologicalDesignOfProductsAndService > 1.75
    ) {
      return 2;
    } else {
      return 1.5;
    }
  }

  public calculateTopicWeightOfD4(companyFacts: CompanyFacts): number {
    return companyFacts.isB2B ? 1.5 : 1;
  }

  public calculateTopicWeightOfE2(calcResults: CalcResults): number {
    if (
      calcResults.socialEnvironmentCalcResults.profitInPercentOfTurnover.isPresent()
    ) {
      const profitInPercentOfTotalSales =
        calcResults.socialEnvironmentCalcResults.profitInPercentOfTurnover.get() as number;
      if (profitInPercentOfTotalSales < 0.05) {
        return 0.5;
      } else if (profitInPercentOfTotalSales > 0.1) {
        return 1.5;
      } else {
        return 1;
      }
    } else {
      return 1;
    }
  }

  public calculateTopicWeightOfE4(calcResults: CalcResults): number {
    if (
      calcResults.socialEnvironmentCalcResults
        .companyIsActiveInMiningOrConstructionIndustry
    ) {
      return 1.5;
    } else if (
      calcResults.employeesCalcResults.companySize === CompanySize.micro ||
      calcResults.employeesCalcResults.companySize === CompanySize.small
    ) {
      return 0.5;
    } else {
      return 1;
    }
  }
}
