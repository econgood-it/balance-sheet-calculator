import {TopicWeihgtCalculator} from "../../src/calculations/topic.weihgt.calculator";
import {CalcResults} from "../../src/calculations/calculator";
import {DatabaseConnectionCreator} from "../../src/database.connection.creator";
import App from "../../src/app";
import {BalanceSheetType, BalanceSheetVersion} from "../../src/entities/enums";
import {CompanyFacts} from "../../src/entities/companyFacts";
import {EmptyCompanyFacts} from "../testData/company.facts";

describe('Topic Weight Calculator', () => {

  let calcResults: CalcResults;
  let companyFacts: CompanyFacts;
  const topicWeihgtCalculator = new TopicWeihgtCalculator();
  const numDigits = 2;
  const calc = async (topicShortName: string, calcResults: CalcResults, companyFacts: CompanyFacts) =>
    await topicWeihgtCalculator.calcTopicWeight(topicShortName, calcResults, companyFacts)

  beforeEach( () => {
    companyFacts = EmptyCompanyFacts;
    calcResults = {
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
  })

  it('should calculate topic weight of A3', async (done) => {
    calcResults.supplyCalcResults.supplyChainWeight = 1.6;
    const topicShortName = 'A3';
    let result = await calc(topicShortName, calcResults, companyFacts);
    expect(result).toBeCloseTo( 2, numDigits);
    calcResults.supplyCalcResults.supplyChainWeight = 1.45;
    result = await calc(topicShortName, calcResults, companyFacts)
    expect(result).toBeCloseTo( 1.5, numDigits);
    calcResults.supplyCalcResults.supplyChainWeight = 1.245;
    result = await calc(topicShortName, calcResults, companyFacts)
    expect(result).toBeCloseTo( 1, numDigits);
    calcResults.supplyCalcResults.supplyChainWeight = 0.74;
    result = await calc(topicShortName, calcResults, companyFacts)
    expect(result).toBeCloseTo( 0.5, numDigits);
    done();
  })

  it('should calculate topic weight of A4', async (done) => {
    calcResults.supplyCalcResults.itucAverage = 4.6;
    const topicShortName = 'A4';
    let result = await calc(topicShortName, calcResults, companyFacts)
    expect(result).toBeCloseTo( 2, numDigits);
    calcResults.supplyCalcResults.itucAverage = 4.4;
    result = await calc(topicShortName, calcResults, companyFacts)
    expect(result).toBeCloseTo( 1.5, numDigits);
    calcResults.supplyCalcResults.itucAverage = 3.255;
    result = await calc(topicShortName, calcResults, companyFacts)
    expect(result).toBeCloseTo( 1, numDigits);
    calcResults.supplyCalcResults.itucAverage = 1.45;
    result = await calc(topicShortName, calcResults, companyFacts)
    expect(result).toBeCloseTo( 0.5, numDigits);
    done();
  })

  it('should calculate topic weight of B1', async (done) => {
    calcResults.financeCalcResults.economicRatio = 0.05;
    const topicShortName = 'B1';
    let result = await calc(topicShortName, calcResults, companyFacts)
    expect(result).toBeCloseTo( 1.5, numDigits);

    calcResults.financeCalcResults.economicRatio = 0.55;
    result = await calc(topicShortName, calcResults, companyFacts)
    expect(result).toBeCloseTo( 0.5, numDigits);

    calcResults.financeCalcResults.economicRatio = 0.2;
    result = await calc(topicShortName, calcResults, companyFacts)
    expect(result).toBeCloseTo( 1, numDigits);

    calcResults.financeCalcResults.companyIsActiveInFinancialServices = true;
    result = await calc(topicShortName, calcResults, companyFacts)
    expect(result).toBeCloseTo( 2, numDigits);

    done();
  })

  it('should calculate topic weight of B2', async (done) => {
    const topicShortName = 'B2';
    companyFacts.financialCosts = 0;
    let result = await calc(topicShortName, calcResults, companyFacts)
    expect(result).toBeCloseTo( 1, numDigits);

    companyFacts.financialCosts = 0.11;
    result = await calc(topicShortName, calcResults, companyFacts)
    expect(result).toBeCloseTo( 1.5, numDigits);

    companyFacts.financialCosts = 0.00099;
    result = await calc(topicShortName, calcResults, companyFacts)
    expect(result).toBeCloseTo( 0, numDigits);

    companyFacts.financialCosts = 0.0299;
    result = await calc(topicShortName, calcResults, companyFacts)
    expect(result).toBeCloseTo( 0.5, numDigits);

    companyFacts.financialCosts = 0.1;
    result = await calc(topicShortName, calcResults, companyFacts)
    expect(result).toBeCloseTo( 1, numDigits);

    done();
  })

  it('should calculate topic weight of B3', async (done) => {
    const topicShortName = 'B3';
    calcResults.financeCalcResults.companyIsActiveInFinancialServices = true;
    let result = await calc(topicShortName, calcResults, companyFacts)
    expect(result).toBeCloseTo( 2, numDigits);

    calcResults.financeCalcResults.companyIsActiveInFinancialServices = false;

    calcResults.financeCalcResults.economicRatioE22 = 0.099;
    result = await calc(topicShortName, calcResults, companyFacts)
    expect(result).toBeCloseTo( 0.5, numDigits);

    calcResults.financeCalcResults.economicRatioE22 = 0.251;
    result = await calc(topicShortName, calcResults, companyFacts)
    expect(result).toBeCloseTo( 1.5, numDigits);

    calcResults.financeCalcResults.economicRatioE22 = 0.245;
    result = await calc(topicShortName, calcResults, companyFacts)
    expect(result).toBeCloseTo( 1, numDigits);

    done();
  })
})