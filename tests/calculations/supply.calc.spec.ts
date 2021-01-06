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


describe('Supply Calculator', () => {

  let companyFacts: CompanyFacts;
  let connection: Connection;
  let regionProvider: RegionProvider;
  let industryProvider: IndustryProvider;

  beforeAll(async (done) => {
    connection = await DatabaseConnectionCreator.createConnectionAndRunMigrations(ConfigurationReader.read());
    const supplyFractions: SupplyFraction[] = [
      new SupplyFraction(undefined, 'B', 'AND', 100),
      new SupplyFraction(undefined, 'Cf', 'ARE', 200),
      new SupplyFraction(undefined, 'Ca', 'AFG', 300),
      new SupplyFraction(undefined, 'J', 'BHR', 400),
      new SupplyFraction(undefined, 'P', 'BHS', 500),
    ];
    companyFacts = EmptyCompanyFacts;
    companyFacts.supplyFractions = supplyFractions;
    regionProvider = await RegionProvider.createFromCompanyFacts(companyFacts, connection.getRepository(Region));
    industryProvider = await IndustryProvider.createFromCompanyFacts(companyFacts, connection.getRepository(Industry));
    done();
  });

  afterAll(async (done) => {
    await connection.close();
    done();
  })


  it('should calculate ', async (done) => {
    const supplyCalcResults: SupplyCalcResults = await new SupplierCalc(regionProvider,
      industryProvider).calculate(companyFacts);
    expect(supplyCalcResults.supplyRiskSum).toBeCloseTo( 3197.88426323363, 13);
    expect(supplyCalcResults.supplyChainWeight).toBeCloseTo(1.62000609960581, 13);
    expect(supplyCalcResults.itucAverage).toBeCloseTo(3.96945539178631, 13);
    done();
  })
})