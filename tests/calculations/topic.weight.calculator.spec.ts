import {TopicWeihgtCalculator} from "../../src/calculations/topic.weihgt.calculator";
import {CalcResults} from "../../src/calculations/calculator";

describe('Topic Weight Calculator', () => {

  it('should calculate topic weight ', async (done) => {
    const topicWeihgtCalculator = new TopicWeihgtCalculator();
    const calcResults: CalcResults = {
      supplyRiskSum: 2.3,
      supplyChainWeight: 1.6,
      normedEmployeesRisk: 1.3,
      sumOfFinancialAspects: 8,
    }
    let result = await topicWeihgtCalculator.calcTopicWeight('A3', calcResults);
    expect(result).toBeCloseTo( 2, 2);
    calcResults.supplyChainWeight = 1.45;
    result = await topicWeihgtCalculator.calcTopicWeight('A3', calcResults);
    expect(result).toBeCloseTo( 1.5, 2);
    calcResults.supplyChainWeight = 1.245;
    result = await topicWeihgtCalculator.calcTopicWeight('A3', calcResults);
    expect(result).toBeCloseTo( 1, 2);
    calcResults.supplyChainWeight = 0.74;
    result = await topicWeihgtCalculator.calcTopicWeight('A3', calcResults);
    expect(result).toBeCloseTo( 0.5, 2);
    done();
  })
})