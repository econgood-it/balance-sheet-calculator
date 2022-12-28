import { StakeholderWeightCalculator } from '../../src/calculations/stakeholder.weight.calculator';

import { CalcResults, Calculator } from '../../src/calculations/calculator';
import { RegionProvider } from '../../src/providers/region.provider';
import { IndustryProvider } from '../../src/providers/industry.provider';
import { BalanceSheetVersion } from '../../src/models/balance.sheet';
import { companyFactsFactory } from '../testData/balance.sheet';
import { CompanyFacts } from '../../src/models/company.facts';

describe('Stakeholder Weight Calculator', () => {
  let companyFacts: CompanyFacts;
  let regionProvider: RegionProvider;
  let industryProvider: IndustryProvider;

  beforeEach(async () => {
    companyFacts = companyFactsFactory.nonEmpty2();
    regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_4
    );
    industryProvider = await IndustryProvider.fromVersion(
      BalanceSheetVersion.v5_0_4
    );
  });

  it('should calculate supplier and employees risk ratio', async () => {
    const precalculations: CalcResults = await new Calculator(
      regionProvider,
      industryProvider
    ).calculate(companyFacts);
    const stakeholderWeightCalculator = new StakeholderWeightCalculator();
    const result =
      await stakeholderWeightCalculator.calculateSupplierAndEmployeesRiskRatio(
        precalculations
      );
    expect(result).toBeCloseTo(17.906127839775003, 13);
  });

  it('should calculate employees risk', async () => {
    const precalculations: CalcResults = await new Calculator(
      regionProvider,
      industryProvider
    ).calculate(companyFacts);
    const stakeholderWeightCalculator = new StakeholderWeightCalculator();
    const result = await stakeholderWeightCalculator.calculateEmployeesRisk(
      precalculations
    );
    expect(result).toBeCloseTo(497.44416815211025, 12);
  });

  it('should calculate financial risk', async () => {
    const precalculations: CalcResults = await new Calculator(
      regionProvider,
      industryProvider
    ).calculate(companyFacts);
    const stakeholderWeightCalculator = new StakeholderWeightCalculator();
    const result = await stakeholderWeightCalculator.calculateFinancialRisk(
      precalculations
    );
    expect(result).toBeCloseTo(66.74357616833971, 13);
  });

  it('should map to value between 60 and 300', () => {
    const stakeholderWeightCalculator = new StakeholderWeightCalculator();
    expect(
      stakeholderWeightCalculator.mapToValueBetween60And300(59.999)
    ).toBeCloseTo(60, 1);
    expect(
      stakeholderWeightCalculator.mapToValueBetween60And300(300.1)
    ).toBeCloseTo(300, 1);
    expect(
      stakeholderWeightCalculator.mapToValueBetween60And300(60.4)
    ).toBeCloseTo(60.4, 1);
    expect(
      stakeholderWeightCalculator.mapToValueBetween60And300(299.999)
    ).toBeCloseTo(299.999, 3);
  });

  it('should calculate stakeholder weights', async () => {
    const calcResults: CalcResults = await new Calculator(
      regionProvider,
      industryProvider
    ).calculate(companyFacts);
    const stakeholderWeightCalculator = new StakeholderWeightCalculator();
    const result = await stakeholderWeightCalculator.calcStakeholderWeights(
      calcResults
    );
    expect(result.get('A')).toBeCloseTo(0.5, 3);
    expect(result.get('B')).toBeCloseTo(1, 2);
    expect(result.get('C')).toBeCloseTo(2, 2);
    expect(result.get('D')).toBeCloseTo(1, 2);
    expect(result.get('E')).toBeCloseTo(1, 2);
  });
});
