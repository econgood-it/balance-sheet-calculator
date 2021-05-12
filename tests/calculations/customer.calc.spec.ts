import { CompanyFacts } from '../../src/entities/companyFacts';
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { Connection } from 'typeorm';
import { ConfigurationReader } from '../../src/configuration.reader';
import { Industry } from '../../src/entities/industry';
import { IndustryProvider } from '../../src/providers/industry.provider';
import { EmptyCompanyFacts } from '../testData/company.facts';
import { CustomerCalc } from '../../src/calculations/customer.calc';
import { IndustrySector } from '../../src/entities/industry.sector';
import { createTranslations } from '../../src/entities/Translations';

describe('Customer Calculator', () => {
  let companyFacts: CompanyFacts;
  let connection: Connection;
  let industryProvider: IndustryProvider;

  beforeAll(async (done) => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        ConfigurationReader.read()
      );
    companyFacts = EmptyCompanyFacts;
    done();
  });

  afterAll(async (done) => {
    await connection.close();
    done();
  });

  it('should calculate when industry sectors empty', async (done) => {
    companyFacts.industrySectors = [];
    industryProvider = await IndustryProvider.createFromCompanyFacts(
      companyFacts,
      connection.getRepository(Industry)
    );
    const customerCalcResults = await new CustomerCalc(
      industryProvider
    ).calculate(companyFacts);
    expect(
      customerCalcResults.sumOfEcologicalDesignOfProductsAndService
    ).toBeCloseTo(0, 1);
    done();
  });

  it('should calculate when industry sectors non empty', async (done) => {
    companyFacts.industrySectors = [
      new IndustrySector(undefined, 'F', 3, createTranslations('en', '')),
      new IndustrySector(undefined, 'A', 4, createTranslations('en', '')),
    ];
    industryProvider = await IndustryProvider.createFromCompanyFacts(
      companyFacts,
      connection.getRepository(Industry)
    );
    const customerCalcResults = await new CustomerCalc(
      industryProvider
    ).calculate(companyFacts);
    expect(
      customerCalcResults.sumOfEcologicalDesignOfProductsAndService
    ).toBeCloseTo(10, 1);
    done();
  });
});
