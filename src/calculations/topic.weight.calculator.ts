import deepFreeze from 'deep-freeze';
import { CalcResults } from './calculator';
import { CompanyFacts } from '../models/company.facts';
import {
  makeWeightingProvider,
  WeightingProvider,
} from '../providers/weightingProvider';
import { makeWeighting } from '../models/weighting';
import { CompanySize } from './employees.calc';

export function makeTopicWeightCalculator(
  calcResults: CalcResults,
  companyFacts: CompanyFacts
) {
  function calculate(): WeightingProvider {
    const topicWeights = makeWeightingProvider([
      { shortName: 'A1', weight: constantWeight() },
      { shortName: 'A2', weight: constantWeight() },
      { shortName: 'A3', weight: calculateTopicWeightOfA3() },
      { shortName: 'A4', weight: calculateTopicWeightOfA4() },
      { shortName: 'B1', weight: calculateTopicWeightOfB1() },
      { shortName: 'B2', weight: calculateTopicWeightOfB2() },
      { shortName: 'B3', weight: calculateTopicWeightOfB3() },
      { shortName: 'B4', weight: calculateTopicWeightOfB4() },
      { shortName: 'C1', weight: constantWeight() },
      { shortName: 'C2', weight: constantWeight() },
      { shortName: 'C3', weight: calculateTopicWeightOfC3() },
      { shortName: 'C4', weight: calculateTopicWeightOfC4() },
      { shortName: 'D1', weight: constantWeight() },
      { shortName: 'D2', weight: constantWeight() },
      { shortName: 'D3', weight: calculateTopicWeightOfD3AndE3() },
      { shortName: 'D4', weight: calculateTopicWeightOfD4() },
      { shortName: 'E1', weight: constantWeight() },
      { shortName: 'E2', weight: calculateTopicWeightOfE2() },
      { shortName: 'E3', weight: calculateTopicWeightOfD3AndE3() },
      { shortName: 'E4', weight: calculateTopicWeightOfE4() },
    ]);
    if (companyFacts.areAllValuesZero()) {
      const allWeightingsAreOne = topicWeights
        .getAll()
        .map((weighting) =>
          makeWeighting({ shortName: weighting.shortName, weight: 1 })
        );
      return makeWeightingProvider(allWeightingsAreOne);
    }
    return topicWeights;
  }

  function constantWeight(): number {
    return 1.0;
  }

  function calculateTopicWeightOfA3(): number {
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
  function calculateTopicWeightOfA4(): number {
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

  function calculateTopicWeightOfB1(): number {
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

  function calculateTopicWeightOfB2(): number {
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

  function calculateTopicWeightOfB3(): number {
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

  function calculateTopicWeightOfB4(): number {
    if (calcResults.employeesCalcResults.companySize === CompanySize.micro) {
      return 0.5;
    } else {
      return 1;
    }
  }

  // Weighting'!O30
  /**
   * In excel this is equal to the cell $'9.Weighting'.O30
   * Excel formula is:
   * =IF(G69="empty";1;IF(AND(I31='12.lan'!D53;I30<10);'3. Calc'!C105;IF(I30>25;'3. Calc'!C103;'3. Calc'!C104)))
   * @param calcResults
   */
  function calculateTopicWeightOfC3(): number {
    if (
      companyFacts.averageJourneyToWorkForStaffInKm < 10 &&
      companyFacts.hasCanteen !== undefined &&
      !companyFacts.hasCanteen
    ) {
      return 0.5;
    } else if (companyFacts.averageJourneyToWorkForStaffInKm > 25) {
      return 1.5;
    } else {
      return 1;
    }
  }

  function calculateTopicWeightOfC4(): number {
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
  function calculateTopicWeightOfD3AndE3(): number {
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

  function calculateTopicWeightOfD4(): number {
    return companyFacts.isB2B ? 1.5 : 1;
  }

  function calculateTopicWeightOfE2(): number {
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

  function calculateTopicWeightOfE4(): number {
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

  return deepFreeze({ calculate });
}
