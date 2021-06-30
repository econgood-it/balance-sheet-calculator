import { CompanyFacts } from '../../src/entities/companyFacts';
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { Connection } from 'typeorm';
import { ConfigurationReader } from '../../src/configuration.reader';
import { EmptyCompanyFacts } from '../testData/company.facts';
import { IndustrySector } from '../../src/entities/industry.sector';
import { SocialEnvironmentCalc } from '../../src/calculations/social.environment.calc';
import { createTranslations } from '../../src/entities/Translations';

describe('Social Environment Calculator', () => {
  let companyFacts: CompanyFacts;
  let connection: Connection;

  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        ConfigurationReader.read()
      );
    companyFacts = EmptyCompanyFacts;
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should return empty option if turnover is zero', async () => {
    companyFacts.profit = 0;
    companyFacts.turnover = 0;
    const socialEnvironmentCalcResults =
      await new SocialEnvironmentCalc().calculate(companyFacts);
    expect(
      socialEnvironmentCalcResults.profitInPercentOfTurnover.isPresent()
    ).toBeFalsy();
  });

  it('should return result if turnover is not zero', async () => {
    companyFacts.profit = 4;
    companyFacts.turnover = 8;
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
    companyFacts.industrySectors = [
      new IndustrySector(undefined, 'B', 0, createTranslations('en', '')),
    ];
    const socialEnvironmentCalcResults =
      await new SocialEnvironmentCalc().calculate(companyFacts);
    expect(
      socialEnvironmentCalcResults.companyIsActiveInMiningOrConstructionIndustry
    ).toBeTruthy();
  });

  it('should return that company is active in construction industry', async () => {
    companyFacts.industrySectors = [
      new IndustrySector(undefined, 'F', 0, createTranslations('en', '')),
    ];
    const socialEnvironmentCalcResults =
      await new SocialEnvironmentCalc().calculate(companyFacts);
    expect(
      socialEnvironmentCalcResults.companyIsActiveInMiningOrConstructionIndustry
    ).toBeTruthy();
  });

  it('should return that company is not active in mining or construction industry', async () => {
    companyFacts.industrySectors = [
      new IndustrySector(undefined, 'A', 0, createTranslations('en', '')),
      new IndustrySector(undefined, 'Ce', 0, createTranslations('en', '')),
    ];
    const socialEnvironmentCalcResults =
      await new SocialEnvironmentCalc().calculate(companyFacts);
    expect(
      socialEnvironmentCalcResults.companyIsActiveInMiningOrConstructionIndustry
    ).toBeFalsy();
  });
});
