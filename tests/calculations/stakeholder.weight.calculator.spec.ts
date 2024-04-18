import { RegionProvider } from '../../src/providers/region.provider';
import { IndustryProvider } from '../../src/providers/industry.provider';
import { makeCompanyFactsFactory } from '../../src/openapi/examples';
import { BalanceSheetVersion } from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { calculate } from '../../src/calculations/calculator';
import { makeStakeholderWeightCalculator } from '../../src/calculations/stakeholder.weight.calculator';

describe('Stakeholder Weight Calculator', () => {
  let regionProvider: RegionProvider;
  let industryProvider: IndustryProvider;

  beforeEach(async () => {
    regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    industryProvider = await IndustryProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
  });

  it('should calculate supplier and employees risk ratio', async () => {
    const precalculations = await calculate(
      regionProvider,
      industryProvider,
      makeCompanyFactsFactory().nonEmpty2()
    );
    const stakeholderWeightCalculator =
      makeStakeholderWeightCalculator(precalculations);
    const result =
      await stakeholderWeightCalculator.calculateSupplierAndEmployeesRiskRatio();
    expect(result).toBeCloseTo(21.27827099197247, 13);
  });

  it('should calculate employees risk', async () => {
    const precalculations = await calculate(
      regionProvider,
      industryProvider,
      makeCompanyFactsFactory().nonEmpty2()
    );
    const stakeholderWeightCalculator =
      makeStakeholderWeightCalculator(precalculations);
    const result = await stakeholderWeightCalculator.calculateEmployeesRisk();
    expect(result).toBeCloseTo(470.73223919736705, 12);
  });

  it('should calculate financial risk', async () => {
    const precalculations = await calculate(
      regionProvider,
      industryProvider,
      makeCompanyFactsFactory().nonEmpty2()
    );
    const stakeholderWeightCalculator =
      makeStakeholderWeightCalculator(precalculations);
    const result = await stakeholderWeightCalculator.calculateFinancialRisk();
    expect(result).toBeCloseTo(86.71121881868801, 13);
  });

  it('should map to value between 60 and 300', async () => {
    const precalculations = await calculate(
      regionProvider,
      industryProvider,
      makeCompanyFactsFactory().nonEmpty2()
    );
    const stakeholderWeightCalculator =
      makeStakeholderWeightCalculator(precalculations);
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
    const calcResults = await calculate(
      regionProvider,
      industryProvider,
      makeCompanyFactsFactory().nonEmpty2()
    );
    const stakeholderWeightCalculator =
      makeStakeholderWeightCalculator(calcResults);
    const result = await stakeholderWeightCalculator.calculate();
    expect(result.getOrFail('A').weight).toBeCloseTo(0.5, 3);
    expect(result.getOrFail('B').weight).toBeCloseTo(1, 2);
    expect(result.getOrFail('C').weight).toBeCloseTo(2, 2);
    expect(result.getOrFail('D').weight).toBeCloseTo(1, 2);
    expect(result.getOrFail('E').weight).toBeCloseTo(1, 2);
  });
});
