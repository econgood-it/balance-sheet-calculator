import { IndustryProvider } from '../../src/providers/industry.provider';

import { CustomerCalc } from '../../src/calculations/customer.calc';
import {
  BalanceSheetVersion,
  CompanyFacts,
} from '../../src/models/balance.sheet';
import { companyFactsFactory } from '../testData/balance.sheet';

describe('Customer Calculator', () => {
  let industryProvider: IndustryProvider;

  it('should calculate when industry sectors empty', async () => {
    const companyFacts = companyFactsFactory.empty();
    industryProvider = await IndustryProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    const customerCalcResults = await new CustomerCalc(
      industryProvider
    ).calculate(companyFacts);
    expect(
      customerCalcResults.sumOfEcologicalDesignOfProductsAndService
    ).toBeCloseTo(1, 1);
  });

  it('should calculate when industry sectors non empty', async () => {
    const companyFacts: CompanyFacts = {
      ...companyFactsFactory.empty(),
      industrySectors: [
        { industryCode: 'F', amountOfTotalTurnover: 0.2, description: '' },
        { industryCode: 'A', amountOfTotalTurnover: 0.4, description: '' },
      ],
    };
    industryProvider = await IndustryProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    const customerCalcResults = await new CustomerCalc(
      industryProvider
    ).calculate(companyFacts);
    expect(
      customerCalcResults.sumOfEcologicalDesignOfProductsAndService
    ).toBeCloseTo(1.2, 1);
  });
});
