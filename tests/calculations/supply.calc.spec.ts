import { CompanyFacts } from "../../src/entities/companyFacts";
import { SupplyFraction } from "../../src/entities/supplyFraction";
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { Connection, Repository } from "typeorm";
import { Region } from "../../src/entities/region";
import { ConfigurationReader } from "../../src/configuration.reader";
import {Industry} from "../../src/entities/industry";
import {SupplierCalc,  SupplyCalcResults} from "../../src/calculations/supplier.calc";


describe('Supply Calculator', () => {

  let companyFacts: CompanyFacts;
  let connection: Connection;
  let regionRepository: Repository<Region>;
  let industryRepository: Repository<Industry>;
  const arabEmiratesCode = "ARE";
  const angolaCode = "AGO";
  const agricultureCode = 'A';
  const pharmaceuticCode = 'Ce';

  beforeAll(async (done) => {
    connection = await DatabaseConnectionCreator.createConnectionAndRunMigrations(ConfigurationReader.read());
    regionRepository = connection.getRepository(Region);
    industryRepository = connection.getRepository(Industry);
    const supplyFractions: SupplyFraction[] = [
      new SupplyFraction(undefined, 'B', 'AND', 100),
      new SupplyFraction(undefined, 'Cf', 'ARE', 200),
      new SupplyFraction(undefined, 'Ca', 'AFG', 300),
      new SupplyFraction(undefined, 'J', 'BHR', 400),
      new SupplyFraction(undefined, 'P', 'BHS', 500),
    ];
    companyFacts = new CompanyFacts(undefined, 0, 0, 0,
      0, 0, 0, supplyFractions, []);
    done();
  });

  afterAll(async (done) => {
    await connection.close();
    done();
  })


  it('should calculate ', async (done) => {
    const supplyCalcResults: SupplyCalcResults = await new SupplierCalc(regionRepository,
      industryRepository).calculate(companyFacts);
    expect(supplyCalcResults.supplyRiskSum).toBeCloseTo( 3197.88426323363, 13);
    expect(supplyCalcResults.supplyChainWeight).toBeCloseTo(1.62000609960581, 13);
    expect(supplyCalcResults.itucAverage).toBeCloseTo(3.96945539178631, 13);
    done();
  })
})