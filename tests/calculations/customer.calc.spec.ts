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


describe('Customer Calculator', () => {

  let companyFacts: CompanyFacts;
  let connection: Connection;
  let regionProvider: RegionProvider;
  let industryProvider: IndustryProvider;

  beforeAll(async (done) => {
    connection = await DatabaseConnectionCreator.createConnectionAndRunMigrations(ConfigurationReader.read());
    companyFacts = EmptyCompanyFacts;
    done();
  });

  afterAll(async (done) => {
    await connection.close();
    done();
  })

  it('should calculate when industry sectors empty', async (done) => {
    companyFacts.industrySectors = [];
    industryProvider = await IndustryProvider.createFromCompanyFacts(companyFacts, connection.getRepository(Industry));
    const customerCalcResults = await new CustomerCalc(industryProvider).calculate(companyFacts);
    expect(customerCalcResults.sumOfEcologicalDesignOfProductsAndService).toBeCloseTo(
      0, 1);
    done();
  })

  it('should calculate when industry sectors non empty', async (done) => {
    companyFacts.industrySectors = [
      new IndustrySector(undefined, "F", 3, ""),
      new IndustrySector(undefined, "A", 4, ""),
    ];
    industryProvider = await IndustryProvider.createFromCompanyFacts(companyFacts, connection.getRepository(Industry));
    const customerCalcResults = await new CustomerCalc(industryProvider).calculate(companyFacts);
    expect(customerCalcResults.sumOfEcologicalDesignOfProductsAndService).toBeCloseTo(
      10, 1);
    done();
  })
})