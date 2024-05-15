import { makeCompanyFacts } from '../../src/models/company.facts';
import {
  DEFAULT_SUPPLY_ECONOMIC_RATIO,
  DEFAULT_SUPPLY_ECONOMIC_RATIO_E22,
  makeFinanceCalc,
} from '../../src/calculations/finance.calc';

describe('Finance Calculator', () => {
  it('should return default value of economic ratio', () => {
    const financeCalcResults = makeFinanceCalc().calculate(makeCompanyFacts());
    expect(financeCalcResults.economicRatio).toBeCloseTo(
      DEFAULT_SUPPLY_ECONOMIC_RATIO,
      3
    );
  });

  it('should return calculated value of economic ratio', () => {
    const companyFacts = makeCompanyFacts().withFields({
      turnover: 2,
      totalAssets: 4,
    });

    const financeCalcResults = makeFinanceCalc().calculate(companyFacts);
    expect(financeCalcResults.economicRatio).toBeCloseTo(0.5, 3);
  });

  it('should return sum of financial aspects', () => {
    const companyFacts = makeCompanyFacts().withFields({
      profit: 20,
      incomeFromFinancialInvestments: 4,
      additionsToFixedAssets: 9,
      financialCosts: 2,
    });

    const financeCalcResults = makeFinanceCalc().calculate(companyFacts);
    expect(financeCalcResults.sumOfFinancialAspects).toBeCloseTo(35, 3);
  });

  it('should return default value of economicRatioE22', () => {
    const companyFacts = makeCompanyFacts().withFields({
      additionsToFixedAssets: 2,
      financialAssetsAndCashBalance: 2,
      totalAssets: 0,
    });

    const financeCalcResults = makeFinanceCalc().calculate(companyFacts);
    expect(financeCalcResults.economicRatioE22).toBeCloseTo(
      DEFAULT_SUPPLY_ECONOMIC_RATIO_E22,
      3
    );
  });

  it('should return calculated value of economicRatioE22', () => {
    const companyFacts = makeCompanyFacts().withFields({
      additionsToFixedAssets: 4,
      financialAssetsAndCashBalance: 4,
      totalAssets: 16,
    });

    const financeCalcResults = makeFinanceCalc().calculate(companyFacts);
    expect(financeCalcResults.economicRatioE22).toBeCloseTo(0.5, 3);
  });
});
