import {SupplierCalc,  SupplyCalcResults} from "../../src/calculations/supplier.calc";
import {CompanyFacts} from "../../src/entities/companyFacts";
import {FinanceCalc, FinanceCalcResults} from "../../src/calculations/finance.calc";


describe('Finance Calculator', () => {

  it('should return default value of economic ratio',  () => {
    const companyFacts = new CompanyFacts(undefined, 0, 0, 0,
      0, 0, 0, 0, 0, [], [],
      []);
    const financeCalcResults: FinanceCalcResults = new FinanceCalc().calculate(companyFacts);
    expect(financeCalcResults.economicRatio).toBeCloseTo( FinanceCalc.DEFAULT_SUPPLY_ECONOMIC_RATIO, 3);
  })

  it('should return calculated value of economic ratio',  () => {
    const companyFacts = new CompanyFacts(undefined, 0, 0, 0,
      0, 0, 0, 2, 4, [], [],
      []);
    const financeCalcResults: FinanceCalcResults = new FinanceCalc().calculate(companyFacts);
    expect(financeCalcResults.economicRatio).toBeCloseTo( 0.5, 3);
  })

  it('should return sum of financial aspects',  () => {
    const companyFacts = new CompanyFacts(undefined, 0, 0, 20,
      2, 4, 9, 0, 0, [], [],
      []);
    const financeCalcResults: FinanceCalcResults = new FinanceCalc().calculate(companyFacts);
    expect(financeCalcResults.sumOfFinancialAspects).toBeCloseTo( 35, 3);
  })
})