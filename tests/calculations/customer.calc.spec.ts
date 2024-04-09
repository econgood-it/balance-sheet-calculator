import { IndustryProvider } from '../../src/providers/industry.provider';
import { BalanceSheetVersion } from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import {
  makeCompanyFacts,
  makeIndustrySector,
} from '../../src/models/company.facts';
import { makeCustomerCalc } from '../../src/calculations/customer.calc';

describe('Customer Calculator', () => {
  let industryProvider: IndustryProvider;

  it('should calculate when industry sectors empty', async () => {
    const companyFacts = makeCompanyFacts();
    industryProvider = await IndustryProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    const results = makeCustomerCalc(industryProvider).calculate(companyFacts);
    expect(results.sumOfEcologicalDesignOfProductsAndService).toBeCloseTo(1, 1);
  });

  it('should calculate when industry sectors non empty', async () => {
    const companyFacts = makeCompanyFacts().withFields({
      industrySectors: [
        makeIndustrySector({
          industryCode: 'F',
          amountOfTotalTurnover: 0.2,
          description: '',
        }),
        makeIndustrySector({
          industryCode: 'A',
          amountOfTotalTurnover: 0.4,
          description: '',
        }),
      ],
    });
    industryProvider = await IndustryProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    const customerCalcResults =
      makeCustomerCalc(industryProvider).calculate(companyFacts);
    expect(
      customerCalcResults.sumOfEcologicalDesignOfProductsAndService
    ).toBeCloseTo(1.2, 1);
  });

  it('should calculate when industry codes of some industry sectors are missing', async () => {
    const companyFacts = makeCompanyFacts().withFields({
      industrySectors: [
        makeIndustrySector({
          industryCode: 'L',
          amountOfTotalTurnover: 0.8,
          description: '',
        }),
        makeIndustrySector({ amountOfTotalTurnover: 0.2, description: '' }),
      ],
    });
    industryProvider = await IndustryProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    const customerCalcResults =
      makeCustomerCalc(industryProvider).calculate(companyFacts);
    expect(
      customerCalcResults.sumOfEcologicalDesignOfProductsAndService
    ).toBeCloseTo(1.8, 2);
  });
});
