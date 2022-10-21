import { CompanyFacts } from '../../src/entities/companyFacts';
import { IndustryProvider } from '../../src/providers/industry.provider';
import { EmptyCompanyFacts } from '../testData/company.facts';
import { CustomerCalc } from '../../src/calculations/customer.calc';
import { IndustrySector } from '../../src/entities/industry.sector';
import { createTranslations } from '../../src/entities/Translations';
import { BalanceSheetVersion } from '../../src/entities/enums';

describe('Customer Calculator', () => {
  let companyFacts: CompanyFacts;
  let industryProvider: IndustryProvider;

  beforeEach(async () => {
    companyFacts = EmptyCompanyFacts;
  });

  it('should calculate when industry sectors empty', async () => {
    companyFacts.industrySectors = [];
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
    companyFacts.industrySectors = [
      new IndustrySector(undefined, 'F', 0.2, createTranslations('en', '')),
      new IndustrySector(undefined, 'A', 0.4, createTranslations('en', '')),
    ];
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
