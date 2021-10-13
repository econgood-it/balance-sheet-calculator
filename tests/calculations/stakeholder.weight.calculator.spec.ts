import { StakeholderWeightCalculator } from '../../src/calculations/stakeholder.weight.calculator';
import { CompanyFacts } from '../../src/entities/companyFacts';
import { SupplyFraction } from '../../src/entities/supplyFraction';
import { EmployeesFraction } from '../../src/entities/employeesFraction';
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { Connection } from 'typeorm';
import { DEFAULT_COUNTRY_CODE, Region } from '../../src/entities/region';
import { ConfigurationReader } from '../../src/configuration.reader';
import { CalcResults, Calculator } from '../../src/calculations/calculator';
import { Industry } from '../../src/entities/industry';
import { RegionProvider } from '../../src/providers/region.provider';
import { IndustryProvider } from '../../src/providers/industry.provider';
import { MainOriginOfOtherSuppliers } from '../../src/entities/main.origin.of.other.suppliers';
import { BalanceSheetVersion } from '../../src/entities/enums';

describe('Stakeholder Weight Calculator', () => {
  let companyFacts: CompanyFacts;
  let connection: Connection;
  let regionProvider: RegionProvider;
  let industryProvider: IndustryProvider;
  const arabEmiratesCode = 'ARE';
  const afghanistanCode = 'AFG';
  const agricultureCode = 'A';
  const pharmaceuticCode = 'Ce';

  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        ConfigurationReader.read()
      );
    const supplyFractions: SupplyFraction[] = [
      new SupplyFraction(undefined, agricultureCode, arabEmiratesCode, 300),
      new SupplyFraction(undefined, pharmaceuticCode, afghanistanCode, 20),
    ];
    const employeesFractions: EmployeesFraction[] = [
      new EmployeesFraction(undefined, arabEmiratesCode, 0.3),
      new EmployeesFraction(undefined, afghanistanCode, 1),
    ];
    companyFacts = new CompanyFacts(
      undefined,
      0,
      2345,
      238,
      473,
      342,
      234,
      30,
      40,
      0,
      0,
      false,
      0,
      false,
      supplyFractions,
      employeesFractions,
      [],
      new MainOriginOfOtherSuppliers(undefined, DEFAULT_COUNTRY_CODE, 0)
    );
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

  it('should calculate supplier and employees risk ratio', async () => {
    const precalculations: CalcResults = await new Calculator(
      regionProvider,
      industryProvider
    ).calculate(companyFacts);
    const stakeholderWeightCalculator = new StakeholderWeightCalculator();
    const result =
      await stakeholderWeightCalculator.calculateSupplierAndEmployeesRiskRatio(
        precalculations
      );
    expect(result).toBeCloseTo(17.8789386768471, 13);
  });

  it('should calculate employees risk', async () => {
    const precalculations: CalcResults = await new Calculator(
      regionProvider,
      industryProvider
    ).calculate(companyFacts);
    const stakeholderWeightCalculator = new StakeholderWeightCalculator();
    const result = await stakeholderWeightCalculator.calculateEmployeesRisk(
      precalculations
    );
    expect(result).toBeCloseTo(497.599891781823, 12);
  });

  it('should calculate financial risk', async () => {
    const precalculations: CalcResults = await new Calculator(
      regionProvider,
      industryProvider
    ).calculate(companyFacts);
    const stakeholderWeightCalculator = new StakeholderWeightCalculator();
    const result = await stakeholderWeightCalculator.calculateFinancialRisk(
      precalculations
    );
    expect(result).toBeCloseTo(66.6422308644823, 13);
  });

  it('should map to value between 60 and 300', () => {
    const stakeholderWeightCalculator = new StakeholderWeightCalculator();
    expect(
      stakeholderWeightCalculator.mapToValueBetween60And300(59.999)
    ).toBeCloseTo(60, 1);
    expect(
      stakeholderWeightCalculator.mapToValueBetween60And300(300.1)
    ).toBeCloseTo(300, 1);
    expect(
      stakeholderWeightCalculator.mapToValueBetween60And300(60.4)
    ).toBeCloseTo(60.4, 1);
    expect(
      stakeholderWeightCalculator.mapToValueBetween60And300(299.999)
    ).toBeCloseTo(299.999, 3);
  });

  it('should calculate stakeholder weights', async () => {
    const calcResults: CalcResults = await new Calculator(
      regionProvider,
      industryProvider
    ).calculate(companyFacts);
    const stakeholderWeightCalculator = new StakeholderWeightCalculator();
    let result: number =
      await stakeholderWeightCalculator.calcStakeholderWeight('A', calcResults);
    expect(result).toBeCloseTo(0.5, 3);
    result = await stakeholderWeightCalculator.calcStakeholderWeight(
      'B',
      calcResults
    );
    expect(result).toBeCloseTo(1, 2);
    result = await stakeholderWeightCalculator.calcStakeholderWeight(
      'C',
      calcResults
    );
    expect(result).toBeCloseTo(2, 2);
    result = await stakeholderWeightCalculator.calcStakeholderWeight(
      'D',
      calcResults
    );
    expect(result).toBeCloseTo(1, 2);
    result = await stakeholderWeightCalculator.calcStakeholderWeight(
      'E',
      calcResults
    );
    expect(result).toBeCloseTo(1, 2);
  });
});
