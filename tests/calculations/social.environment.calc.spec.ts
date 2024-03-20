import { SocialEnvironmentCalc } from '../../src/calculations/social.environment.calc';
import { OldCompanyFacts } from '../../src/models/oldCompanyFacts';
import { companyFactsFactory } from '../../src/openapi/examples';

describe('Social Environment Calculator', () => {
  it('should return empty option if turnover is zero', async () => {
    const companyFacts = {
      ...companyFactsFactory.empty(),
      profit: 0,
      turnover: 0,
    };
    const socialEnvironmentCalcResults =
      await new SocialEnvironmentCalc().calculate(companyFacts);
    expect(
      socialEnvironmentCalcResults.profitInPercentOfTurnover.isPresent()
    ).toBeFalsy();
  });

  it('should return result if turnover is not zero', async () => {
    const companyFacts = {
      ...companyFactsFactory.empty(),
      profit: 4,
      turnover: 8,
    };
    const socialEnvironmentCalcResults =
      await new SocialEnvironmentCalc().calculate(companyFacts);
    expect(
      socialEnvironmentCalcResults.profitInPercentOfTurnover.isPresent()
    ).toBeTruthy();
    expect(
      socialEnvironmentCalcResults.profitInPercentOfTurnover.get()
    ).toBeCloseTo(0.5, 2);
  });

  it('should return that company is active in mining', async () => {
    const companyFacts: OldCompanyFacts = {
      ...companyFactsFactory.empty(),
      industrySectors: [
        {
          industryCode: 'B',
          amountOfTotalTurnover: 0,
          description: '',
        },
      ],
    };
    const socialEnvironmentCalcResults =
      await new SocialEnvironmentCalc().calculate(companyFacts);
    expect(
      socialEnvironmentCalcResults.companyIsActiveInMiningOrConstructionIndustry
    ).toBeTruthy();
  });

  it('should return that company is active in construction industry', async () => {
    const companyFacts: OldCompanyFacts = {
      ...companyFactsFactory.empty(),
      industrySectors: [
        {
          industryCode: 'F',
          amountOfTotalTurnover: 0,
          description: '',
        },
      ],
    };
    const socialEnvironmentCalcResults =
      await new SocialEnvironmentCalc().calculate(companyFacts);
    expect(
      socialEnvironmentCalcResults.companyIsActiveInMiningOrConstructionIndustry
    ).toBeTruthy();
  });

  it('should return that company is not active in mining or construction industry', async () => {
    const companyFacts: OldCompanyFacts = {
      ...companyFactsFactory.empty(),
      industrySectors: [
        {
          industryCode: 'A',
          amountOfTotalTurnover: 0,
          description: '',
        },
        {
          industryCode: 'Ce',
          amountOfTotalTurnover: 0,
          description: '',
        },
      ],
    };
    const socialEnvironmentCalcResults =
      await new SocialEnvironmentCalc().calculate(companyFacts);
    expect(
      socialEnvironmentCalcResults.companyIsActiveInMiningOrConstructionIndustry
    ).toBeFalsy();
  });
});
