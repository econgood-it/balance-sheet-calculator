import { CompanyFacts } from '../../src/entities/companyFacts';
import { SupplyFraction } from '../../src/entities/supplyFraction';
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { Connection } from 'typeorm';
import { Region } from '../../src/entities/region';
import { ConfigurationReader } from '../../src/configuration.reader';
import { Industry } from '../../src/entities/industry';
import {
  SupplierCalc,
  SupplyCalcResults,
} from '../../src/calculations/supplier.calc';
import { RegionProvider } from '../../src/providers/region.provider';
import { IndustryProvider } from '../../src/providers/industry.provider';
import { EmptyCompanyFacts } from '../testData/company.facts';
import { computeCostsOfMainOriginOfOtherSuppliers } from '../../src/entities/main.origin.of.other.suppliers';
import { BalanceSheetVersion } from '../../src/entities/enums';

describe('Supply Calculator', () => {
  let companyFacts: CompanyFacts;
  let connection: Connection;
  let regionProvider: RegionProvider;
  let industryProvider: IndustryProvider;
  const useNonDefaultMainOriginOfOtherSuppliers = () => {
    companyFacts.totalPurchaseFromSuppliers = 2000;
    companyFacts.mainOriginOfOtherSuppliers.costs =
      computeCostsOfMainOriginOfOtherSuppliers(
        companyFacts.totalPurchaseFromSuppliers,
        companyFacts.supplyFractions
      );
    companyFacts.mainOriginOfOtherSuppliers.countryCode = 'BRA';
  };

  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        ConfigurationReader.read()
      );
    const supplyFractions: SupplyFraction[] = [
      new SupplyFraction(undefined, 'B', 'AND', 100),
      new SupplyFraction(undefined, 'Cf', 'ARE', 200),
      new SupplyFraction(undefined, 'Ca', 'AFG', 300),
      new SupplyFraction(undefined, 'J', 'BHR', 400),
      new SupplyFraction(undefined, 'P', 'BHS', 500),
    ];
    companyFacts = EmptyCompanyFacts;

    companyFacts.supplyFractions = supplyFractions;
    regionProvider = await RegionProvider.createFromCompanyFacts(
      companyFacts,
      connection.getRepository(Region),
      BalanceSheetVersion.v5_0_4
    );
    industryProvider = await IndustryProvider.createFromCompanyFacts(
      companyFacts,
      connection.getRepository(Industry)
    );
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should calculate ', async () => {
    const supplyCalcResults: SupplyCalcResults = await new SupplierCalc(
      regionProvider,
      industryProvider
    ).calculate(companyFacts);
    expect(supplyCalcResults.supplyRiskSum).toBeCloseTo(3197.88426323363, 13);
    expect(supplyCalcResults.supplyChainWeight).toBeCloseTo(
      1.62000609960581,
      13
    );
    expect(supplyCalcResults.itucAverage).toBeCloseTo(3.96945539178631, 13);
  });

  it('should calculate supply risk sum', async () => {
    useNonDefaultMainOriginOfOtherSuppliers();
    regionProvider = await RegionProvider.createFromCompanyFacts(
      companyFacts,
      connection.getRepository(Region),
      BalanceSheetVersion.v5_0_4
    );
    const supplyCalcResults: SupplyCalcResults = await new SupplierCalc(
      regionProvider,
      industryProvider
    ).calculate(companyFacts);
    expect(supplyCalcResults.supplyRiskSum).toBeCloseTo(4088.020319545176, 13);
  });

  it('should calculate supply risk of mainOriginOfOtherSuppliers', async () => {
    useNonDefaultMainOriginOfOtherSuppliers();
    regionProvider = await RegionProvider.createFromCompanyFacts(
      companyFacts,
      connection.getRepository(Region),
      BalanceSheetVersion.v5_0_4
    );
    const supplyRiskSum = new SupplierCalc(
      regionProvider,
      industryProvider
    ).supplyRiskSum(companyFacts);
    const supplyRisk = new SupplierCalc(
      regionProvider,
      industryProvider
    ).supplyRisk(companyFacts.mainOriginOfOtherSuppliers, supplyRiskSum);
    expect(supplyRisk).toBeCloseTo(0.21774257139959138, 13);
  });
  it('should calculate ituc average', async () => {
    useNonDefaultMainOriginOfOtherSuppliers();
    regionProvider = await RegionProvider.createFromCompanyFacts(
      companyFacts,
      connection.getRepository(Region),
      BalanceSheetVersion.v5_0_4
    );
    const supplyRiskSum = new SupplierCalc(
      regionProvider,
      industryProvider
    ).supplyRiskSum(companyFacts);
    const itucAverage = new SupplierCalc(
      regionProvider,
      industryProvider
    ).itucAverage(companyFacts, supplyRiskSum);
    expect(itucAverage).toBeCloseTo(3.7583636819215593, 13);
  });
});
