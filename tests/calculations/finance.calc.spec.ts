import {
  FinanceCalc,
  FinanceCalcResults,
} from '../../src/calculations/finance.calc';
import { companyFactsFactory } from '../../src/openapi/examples';

describe('Finance Calculator', () => {
  it('should return default value of economic ratio', () => {
    const financeCalcResults: FinanceCalcResults = new FinanceCalc().calculate(
      companyFactsFactory.empty()
    );
    expect(financeCalcResults.economicRatio).toBeCloseTo(
      FinanceCalc.DEFAULT_SUPPLY_ECONOMIC_RATIO,
      3
    );
  });

  it('should return calculated value of economic ratio', () => {
    const companyFacts = {
      ...companyFactsFactory.empty(),
      turnover: 2,
      totalAssets: 4,
    };

    const financeCalcResults: FinanceCalcResults = new FinanceCalc().calculate(
      companyFacts
    );
    expect(financeCalcResults.economicRatio).toBeCloseTo(0.5, 3);
  });

  it('should return sum of financial aspects', () => {
    const companyFacts = {
      ...companyFactsFactory.empty(),
      profit: 20,
      incomeFromFinancialInvestments: 4,
      additionsToFixedAssets: 9,
      financialCosts: 2,
    };

    const financeCalcResults: FinanceCalcResults = new FinanceCalc().calculate(
      companyFacts
    );
    expect(financeCalcResults.sumOfFinancialAspects).toBeCloseTo(35, 3);
  });

  it('should return default value of economicRatioE22', () => {
    const companyFacts = {
      ...companyFactsFactory.empty(),
      additionsToFixedAssets: 2,
      financialAssetsAndCashBalance: 2,
      totalAssets: 0,
    };

    const financeCalcResults: FinanceCalcResults = new FinanceCalc().calculate(
      companyFacts
    );
    expect(financeCalcResults.economicRatioE22).toBeCloseTo(
      FinanceCalc.DEFAULT_SUPPLY_ECONOMIC_RATIO_E22,
      3
    );
  });

  it('should return calculated value of economicRatioE22', () => {
    const companyFacts = {
      ...companyFactsFactory.empty(),
      additionsToFixedAssets: 4,
      financialAssetsAndCashBalance: 4,
      totalAssets: 16,
    };

    const financeCalcResults = new FinanceCalc().calculate(companyFacts);
    expect(financeCalcResults.economicRatioE22).toBeCloseTo(0.5, 3);
  });
});
