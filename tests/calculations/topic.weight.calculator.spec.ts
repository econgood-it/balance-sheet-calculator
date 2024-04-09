import { TopicWeightCalculator } from '../../src/calculations/topic.weight.calculator';
import { CalcResults } from '../../src/calculations/calculator';

import { CompanySize } from '../../src/calculations/old.employees.calc';
import { none, some } from '../../src/calculations/option';
import { OldCompanyFacts } from '../../src/models/oldCompanyFacts';
import { companyFactsFactory } from '../../src/openapi/examples';

describe('Topic Weight Calculator', () => {
  let calcResults: CalcResults;
  let companyFacts: OldCompanyFacts;
  const topicWeihgtCalculator = new TopicWeightCalculator();
  const numDigits = 2;
  const calc = async (
    topicShortName: string,
    calcResults: CalcResults,
    companyFacts: OldCompanyFacts
  ) => {
    const topicWeights = topicWeihgtCalculator.calcTopicWeights(
      calcResults,
      companyFacts
    );
    return topicWeights.getOrFail(topicShortName);
  };

  beforeEach(() => {
    companyFacts = {
      ...companyFactsFactory.empty(),
      profit: 1,
    };
    calcResults = {
      supplyCalcResults: {
        itucAverage: 1,
        supplyRiskSum: 2.3,
        supplyChainWeight: 1.6,
      },
      financeCalcResults: {
        sumOfFinancialAspects: 8,
        economicRatio: 2,
        companyIsActiveInFinancialServices: false,
        economicRatioE22: 0,
      },
      employeesCalcResults: {
        normedEmployeesRisk: 1.3,
        companySize: CompanySize.micro,
        itucAverage: 0,
      },
      customerCalcResults: {
        sumOfEcologicalDesignOfProductsAndService: 0,
      },
      socialEnvironmentCalcResults: {
        profitInPercentOfTurnover: some(0),
        companyIsActiveInMiningOrConstructionIndustry: false,
      },
    };
  });

  it('should calculate topic weight of A3', async () => {
    calcResults.supplyCalcResults.supplyChainWeight = 1.6;
    const topicShortName = 'A3';
    let result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(2, numDigits);
    calcResults.supplyCalcResults.supplyChainWeight = 1.45;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1.5, numDigits);
    calcResults.supplyCalcResults.supplyChainWeight = 1.245;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);
    calcResults.supplyCalcResults.supplyChainWeight = 0.74;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(0.5, numDigits);
  });

  it('should calculate topic weight of A4', async () => {
    calcResults.supplyCalcResults.itucAverage = 4.6;
    const topicShortName = 'A4';
    let result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(2, numDigits);
    calcResults.supplyCalcResults.itucAverage = 4.4;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1.5, numDigits);
    calcResults.supplyCalcResults.itucAverage = 3.255;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);
    calcResults.supplyCalcResults.itucAverage = 1.45;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(0.5, numDigits);
  });

  it('should calculate topic weight of B1', async () => {
    calcResults.financeCalcResults.economicRatio = 0.05;
    const topicShortName = 'B1';
    let result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1.5, numDigits);

    calcResults.financeCalcResults.economicRatio = 0.55;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(0.5, numDigits);

    calcResults.financeCalcResults.economicRatio = 0.2;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);

    calcResults.financeCalcResults.companyIsActiveInFinancialServices = true;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(2, numDigits);
  });

  it('should calculate topic weight of B2', async () => {
    const topicShortName = 'B2';
    calcResults.socialEnvironmentCalcResults.profitInPercentOfTurnover =
      some(0);
    let result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(0, numDigits);

    calcResults.socialEnvironmentCalcResults.profitInPercentOfTurnover =
      some(0.11);
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1.5, numDigits);

    calcResults.socialEnvironmentCalcResults.profitInPercentOfTurnover =
      some(0.00099);
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(0, numDigits);

    calcResults.socialEnvironmentCalcResults.profitInPercentOfTurnover =
      some(0.0299);
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(0.5, numDigits);

    calcResults.socialEnvironmentCalcResults.profitInPercentOfTurnover =
      some(0.1);
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);

    calcResults.socialEnvironmentCalcResults.profitInPercentOfTurnover = none();
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);
  });

  it('should calculate topic weight of B3', async () => {
    const topicShortName = 'B3';
    calcResults.financeCalcResults.companyIsActiveInFinancialServices = true;
    let result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(2, numDigits);

    calcResults.financeCalcResults.companyIsActiveInFinancialServices = false;

    calcResults.financeCalcResults.economicRatioE22 = 0.099;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(0.5, numDigits);

    calcResults.financeCalcResults.economicRatioE22 = 0.251;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1.5, numDigits);

    calcResults.financeCalcResults.economicRatioE22 = 0.245;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);
  });

  it('should calculate topic weight of B4', async () => {
    const topicShortName = 'B4';
    calcResults.employeesCalcResults.companySize = CompanySize.micro;
    let result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(0.5, numDigits);

    calcResults.employeesCalcResults.companySize = CompanySize.small;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);

    calcResults.employeesCalcResults.companySize = CompanySize.middle;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);

    calcResults.employeesCalcResults.companySize = CompanySize.large;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);
  });

  it('should calculate topic weight of C1', async () => {
    const topicShortName = 'C1';
    const result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);
  });

  it('should calculate topic weight of C2', async () => {
    const topicShortName = 'C2';
    const result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);
  });

  it('should calculate topic weight of C3', async () => {
    const topicShortName = 'C3';
    companyFacts.hasCanteen = false;
    companyFacts.averageJourneyToWorkForStaffInKm = 9;
    let result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(0.5, numDigits);

    companyFacts.hasCanteen = undefined;
    companyFacts.averageJourneyToWorkForStaffInKm = 9;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);

    companyFacts.hasCanteen = true;
    companyFacts.averageJourneyToWorkForStaffInKm = 9;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);

    companyFacts.hasCanteen = false;
    companyFacts.averageJourneyToWorkForStaffInKm = 25.5;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1.5, numDigits);

    companyFacts.hasCanteen = true;
    companyFacts.averageJourneyToWorkForStaffInKm = 25.5;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1.5, numDigits);
  });

  it('should calculate topic weight of C4', async () => {
    const topicShortName = 'C4';
    companyFacts.numberOfEmployees = 1;
    let result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(0, numDigits);

    companyFacts.numberOfEmployees = 2;
    calcResults.employeesCalcResults.companySize = CompanySize.micro;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(0.5, numDigits);

    companyFacts.numberOfEmployees = 2;
    calcResults.employeesCalcResults.companySize = CompanySize.small;
    calcResults.employeesCalcResults.itucAverage = 3.26;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1.5, numDigits);

    companyFacts.numberOfEmployees = 2;
    calcResults.employeesCalcResults.companySize = CompanySize.small;
    calcResults.employeesCalcResults.itucAverage = 3.25;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);
  });

  it('should calculate topic weight of D1', async () => {
    const topicShortName = 'D1';
    const result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);
  });

  it('should calculate topic weight of D2', async () => {
    const topicShortName = 'D2';
    const result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);
  });

  it('should calculate topic weight of D3', async () => {
    const topicShortName = 'D3';
    calcResults.customerCalcResults.sumOfEcologicalDesignOfProductsAndService = 0.74;
    let result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(0.5, numDigits);

    calcResults.customerCalcResults.sumOfEcologicalDesignOfProductsAndService = 1.24;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);

    calcResults.customerCalcResults.sumOfEcologicalDesignOfProductsAndService = 1.76;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(2, numDigits);

    calcResults.customerCalcResults.sumOfEcologicalDesignOfProductsAndService = 1.25;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1.5, numDigits);
  });

  it('should calculate topic weight of D4', async () => {
    const topicShortName = 'D4';
    companyFacts.isB2B = true;
    let result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1.5, numDigits);

    companyFacts.isB2B = false;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);
  });

  it('should calculate topic weight of E1', async () => {
    const topicShortName = 'E1';
    const result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);
  });

  it('should calculate topic weight of E2', async () => {
    const topicShortName = 'E2';
    calcResults.socialEnvironmentCalcResults.profitInPercentOfTurnover =
      some(0.11);
    let result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1.5, numDigits);

    calcResults.socialEnvironmentCalcResults.profitInPercentOfTurnover = none();
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);

    calcResults.socialEnvironmentCalcResults.profitInPercentOfTurnover =
      some(0.04);
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(0.5, numDigits);

    calcResults.socialEnvironmentCalcResults.profitInPercentOfTurnover =
      some(0.09);
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);
  });

  it('should calculate topic weight of E3', async () => {
    const topicShortName = 'E3';
    calcResults.customerCalcResults.sumOfEcologicalDesignOfProductsAndService = 0.74;
    let result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(0.5, numDigits);

    calcResults.customerCalcResults.sumOfEcologicalDesignOfProductsAndService = 1.24;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);

    calcResults.customerCalcResults.sumOfEcologicalDesignOfProductsAndService = 1.76;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(2, numDigits);

    calcResults.customerCalcResults.sumOfEcologicalDesignOfProductsAndService = 1.25;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1.5, numDigits);
  });

  it('should calculate topic weight of E4', async () => {
    const topicShortName = 'E4';
    calcResults.socialEnvironmentCalcResults.companyIsActiveInMiningOrConstructionIndustry =
      true;
    let result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1.5, numDigits);

    calcResults.socialEnvironmentCalcResults.companyIsActiveInMiningOrConstructionIndustry =
      false;
    calcResults.employeesCalcResults.companySize = CompanySize.micro;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(0.5, numDigits);

    calcResults.socialEnvironmentCalcResults.companyIsActiveInMiningOrConstructionIndustry =
      false;
    calcResults.employeesCalcResults.companySize = CompanySize.small;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(0.5, numDigits);

    calcResults.socialEnvironmentCalcResults.companyIsActiveInMiningOrConstructionIndustry =
      false;
    calcResults.employeesCalcResults.companySize = CompanySize.middle;
    result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo(1, numDigits);
  });

  it('should return for all topics a weight of 1 if company facts values are all zero', async () => {
    const topicWeights = topicWeihgtCalculator.calcTopicWeights(
      calcResults,
      companyFactsFactory.empty()
    );
    expect(topicWeights.size).toBe(20);
    for (const [, value] of topicWeights.entries()) {
      expect(value).toBe(1);
    }
  });
});
