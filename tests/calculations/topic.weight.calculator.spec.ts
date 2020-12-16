import {TopicWeihgtCalculator} from "../../src/calculations/topic.weihgt.calculator";
import {CalcResults} from "../../src/calculations/calculator";

describe('Topic Weight Calculator', () => {

  let calcResults: CalcResults = {
    supplyCalcResults: {
      itucAverage: 1,
      supplyRiskSum: 2.3,
      supplyChainWeight: 1.6,
    },
    financeCalcResults: {
      sumOfFinancialAspects: 8,
      economicRatio: 2,
      companyIsActiveInFinancialServices: false
    },
    employeesCalcResults: {
      normedEmployeesRisk: 1.3,
    }
  }

  it('should calculate topic weight of A3', async (done) => {
    const topicWeihgtCalculator = new TopicWeihgtCalculator();
    calcResults.supplyCalcResults.supplyChainWeight = 1.6;
    const topicShortName = 'A3';
    let result = await topicWeihgtCalculator.calcTopicWeight(topicShortName, calcResults);
    expect(result).toBeCloseTo( 2, 2);
    calcResults.supplyCalcResults.supplyChainWeight = 1.45;
    result = await topicWeihgtCalculator.calcTopicWeight(topicShortName, calcResults);
    expect(result).toBeCloseTo( 1.5, 2);
    calcResults.supplyCalcResults.supplyChainWeight = 1.245;
    result = await topicWeihgtCalculator.calcTopicWeight(topicShortName, calcResults);
    expect(result).toBeCloseTo( 1, 2);
    calcResults.supplyCalcResults.supplyChainWeight = 0.74;
    result = await topicWeihgtCalculator.calcTopicWeight(topicShortName, calcResults);
    expect(result).toBeCloseTo( 0.5, 2);
    done();
  })

  it('should calculate topic weight of A4', async (done) => {
    const topicWeihgtCalculator = new TopicWeihgtCalculator();
    calcResults.supplyCalcResults.itucAverage = 4.6;
    const topicShortName = 'A4';
    let result = await topicWeihgtCalculator.calcTopicWeight(topicShortName, calcResults);
    expect(result).toBeCloseTo( 2, 2);
    calcResults.supplyCalcResults.itucAverage = 4.4;
    result = await topicWeihgtCalculator.calcTopicWeight(topicShortName, calcResults);
    expect(result).toBeCloseTo( 1.5, 2);
    calcResults.supplyCalcResults.itucAverage = 3.255;
    result = await topicWeihgtCalculator.calcTopicWeight(topicShortName, calcResults);
    expect(result).toBeCloseTo( 1, 2);
    calcResults.supplyCalcResults.itucAverage = 1.45;
    result = await topicWeihgtCalculator.calcTopicWeight(topicShortName, calcResults);
    expect(result).toBeCloseTo( 0.5, 2);
    done();
  })

  it('should calculate topic weight of B1', async (done) => {
    const topicWeihgtCalculator = new TopicWeihgtCalculator();
    calcResults.financeCalcResults.economicRatio = 0.05;
    const topicShortName = 'B1';
    let result = await topicWeihgtCalculator.calcTopicWeight(topicShortName, calcResults);
    expect(result).toBeCloseTo( 1.5, 2);

    calcResults.financeCalcResults.economicRatio = 0.55;
    result = await topicWeihgtCalculator.calcTopicWeight(topicShortName, calcResults);
    expect(result).toBeCloseTo( 0.5, 2);

    calcResults.financeCalcResults.economicRatio = 0.2;
    result = await topicWeihgtCalculator.calcTopicWeight(topicShortName, calcResults);
    expect(result).toBeCloseTo( 1, 2);

    calcResults.financeCalcResults.companyIsActiveInFinancialServices = true;
    result = await topicWeihgtCalculator.calcTopicWeight(topicShortName, calcResults);
    expect(result).toBeCloseTo( 2, 2);

    done();
  })
})