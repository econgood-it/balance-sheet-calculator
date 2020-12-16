import {CompanyFacts} from "../../src/entities/companyFacts";
import {FinanceCalc, FinanceCalcResults} from "../../src/calculations/finance.calc";
import {EmptyCompanyFacts} from "../testData/company.facts";


describe('Finance Calculator', () => {

  let companyFacts: CompanyFacts;

  beforeEach(() => {
    companyFacts = EmptyCompanyFacts;
  })

  it('should return default value of economic ratio',  () => {
    const financeCalcResults: FinanceCalcResults = new FinanceCalc().calculate(companyFacts);
    expect(financeCalcResults.economicRatio).toBeCloseTo( FinanceCalc.DEFAULT_SUPPLY_ECONOMIC_RATIO, 3);
  })

  it('should return calculated value of economic ratio',  () => {
    companyFacts.turnover = 2;
    companyFacts.totalAssets = 4;
    const financeCalcResults: FinanceCalcResults = new FinanceCalc().calculate(companyFacts);
    expect(financeCalcResults.economicRatio).toBeCloseTo( 0.5, 3);
  })

  it('should return sum of financial aspects',  () => {
    companyFacts.financialCosts = 2;
    companyFacts.profit = 20;
    companyFacts.incomeFromFinancialInvestments = 4;
    companyFacts.additionsToFixedAssets = 9;
    const financeCalcResults: FinanceCalcResults = new FinanceCalc().calculate(companyFacts);
    expect(financeCalcResults.sumOfFinancialAspects).toBeCloseTo( 35, 3);
  })

  it('should return default value of economicRatioE22',  () => {
    companyFacts.additionsToFixedAssets = 2;
    companyFacts.financialAssetsAndCashBalance = 2;
    companyFacts.totalAssets = 0;
    const financeCalcResults: FinanceCalcResults = new FinanceCalc().calculate(companyFacts);
    expect(financeCalcResults.economicRatioE22).toBeCloseTo( FinanceCalc.DEFAULT_SUPPLY_ECONOMIC_RATIO_E22, 3);
  })

  it('should return calculated value of economicRatioE22',  () => {
    companyFacts.additionsToFixedAssets = 4;
    companyFacts.financialAssetsAndCashBalance = 4;
    companyFacts.totalAssets = 16;
    let financeCalcResults = new FinanceCalc().calculate(companyFacts);
    expect(financeCalcResults.economicRatioE22).toBeCloseTo( 0.5, 3);
  })
})