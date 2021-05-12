import { Connection, Repository } from 'typeorm';
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { ConfigurationReader } from '../../src/configuration.reader';
import { CompanyFacts } from '../../src/entities/companyFacts';
import { EmptyCompanyFacts } from '../testData/company.facts';
import { SupplyFraction } from '../../src/entities/supplyFraction';
import { Industry } from '../../src/entities/industry';
import { IndustryProvider } from '../../src/providers/industry.provider';
import { IndustrySector } from '../../src/entities/industry.sector';
import { createTranslations } from '../../src/entities/Translations';

describe('Industry Provider', () => {
  let connection: Connection;
  let companyFacts: CompanyFacts;
  let industryRepo: Repository<Industry>;

  beforeAll(async (done) => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        ConfigurationReader.read()
      );
    industryRepo = await connection.getRepository(Industry);
    companyFacts = EmptyCompanyFacts;
    done();
  });

  afterAll(async (done) => {
    await connection.close();
    done();
  });

  it('should contain industries of supplyfractions', async (done) => {
    companyFacts.supplyFractions = [
      new SupplyFraction(undefined, 'A', 'CRI', 100),
      new SupplyFraction(undefined, 'B', 'DEU', 200),
    ];
    const industryProvider = await IndustryProvider.createFromCompanyFacts(
      companyFacts,
      industryRepo
    );
    expect(industryProvider.getOrFail('B').industryCode).toBe('B');
    expect(industryProvider.getOrFail('A').industryCode).toBe('A');
    done();
  });

  it('should contain industries of industry sectors', async (done) => {
    companyFacts.industrySectors = [
      new IndustrySector(undefined, 'A', 0.6, createTranslations('en', 'Desc')),
      new IndustrySector(
        undefined,
        'Ce',
        0.9,
        createTranslations('en', 'Desc')
      ),
    ];
    const industryProvider = await IndustryProvider.createFromCompanyFacts(
      companyFacts,
      industryRepo
    );
    expect(industryProvider.getOrFail('Ce').industryCode).toBe('Ce');
    expect(industryProvider.getOrFail('A').industryCode).toBe('A');
    done();
  });
});
