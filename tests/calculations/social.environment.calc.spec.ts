import { CompanyFacts } from "../../src/entities/companyFacts";
import { SupplyFraction } from "../../src/entities/supplyFraction";
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { Connection, Repository } from "typeorm";
import { Region } from "../../src/entities/region";
import { ConfigurationReader } from "../../src/configuration.reader";
import {Industry} from "../../src/entities/industry";
import {SupplierCalc,  SupplyCalcResults} from "../../src/calculations/supplier.calc";
import {RegionProvider} from "../../src/providers/region.provider";
import {IndustryProvider} from "../../src/providers/industry.provider";
import {EmptyCompanyFacts} from "../testData/company.facts";
import {CustomerCalc} from "../../src/calculations/customer.calc";
import {IndustrySector} from "../../src/entities/industry.sector";
import {SocialEnvironmentCalc} from "../../src/calculations/social.environment.calc";


describe('Social Environment Calculator', () => {

  let companyFacts: CompanyFacts;
  let connection: Connection;

  beforeAll(async (done) => {
    connection = await DatabaseConnectionCreator.createConnectionAndRunMigrations(ConfigurationReader.read());
    companyFacts = EmptyCompanyFacts;
    done();
  });

  afterAll(async (done) => {
    await connection.close();
    done();
  })

  it('should return empty option if totalSales is zero', async (done) => {
    companyFacts.profit = 0;
    companyFacts.totalSales = 0;
    const socialEnvironmentCalcResults = await new SocialEnvironmentCalc().calculate(companyFacts);
    expect(socialEnvironmentCalcResults.profitInPercentOfTotalSales.isPresent()).toBeFalsy();
    done();
  })

  it('should return result if totalSales is not zero', async (done) => {
    companyFacts.profit = 4;
    companyFacts.totalSales = 8;
    const socialEnvironmentCalcResults = await new SocialEnvironmentCalc().calculate(companyFacts);
    expect(socialEnvironmentCalcResults.profitInPercentOfTotalSales.isPresent()).toBeTruthy();
    expect(socialEnvironmentCalcResults.profitInPercentOfTotalSales.get()).toBeCloseTo(0.5, 2);
    done();
  })

  it('should return that company is active in mining', async (done) => {
    companyFacts.industrySectors = [new IndustrySector(undefined, 'B', 0, "")]
    const socialEnvironmentCalcResults = await new SocialEnvironmentCalc().calculate(companyFacts);
    expect(socialEnvironmentCalcResults.companyIsActiveInMiningOrConstructionIndustry).toBeTruthy();
    done();
  })

  it('should return that company is active in construction industry', async (done) => {
    companyFacts.industrySectors = [new IndustrySector(undefined, 'F', 0, "")]
    const socialEnvironmentCalcResults = await new SocialEnvironmentCalc().calculate(companyFacts);
    expect(socialEnvironmentCalcResults.companyIsActiveInMiningOrConstructionIndustry).toBeTruthy();
    done();
  })

  it('should return that company is not active in mining or construction industry', async (done) => {
    companyFacts.industrySectors = [new IndustrySector(undefined, 'A', 0, ""),
      new IndustrySector(undefined, 'Ce', 0, "")]
    const socialEnvironmentCalcResults = await new SocialEnvironmentCalc().calculate(companyFacts);
    expect(socialEnvironmentCalcResults.companyIsActiveInMiningOrConstructionIndustry).toBeFalsy();
    done();
  })

})