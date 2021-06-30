import { CompanyFacts } from '../../src/entities/companyFacts';
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { Connection } from 'typeorm';
import { Region } from '../../src/entities/region';
import { ConfigurationReader } from '../../src/configuration.reader';
import { RegionProvider } from '../../src/providers/region.provider';
import { EmptyCompanyFacts } from '../testData/company.facts';
import {
  CompanySize,
  EmployeesCalc,
  EmployeesCalcResults,
} from '../../src/calculations/employees.calc';
import { EmployeesFraction } from '../../src/entities/employeesFraction';

describe('Employees Calculator', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        ConfigurationReader.read()
      );
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('should calculate the itucAverage ', () => {
    let companyFacts: CompanyFacts;
    let regionProvider: RegionProvider;
    beforeEach(async () => {
      companyFacts = EmptyCompanyFacts;
    });

    const calc = async (
      companyFacts: CompanyFacts
    ): Promise<EmployeesCalcResults> => {
      regionProvider = await RegionProvider.createFromCompanyFacts(
        companyFacts,
        connection.getRepository(Region)
      );
      return new EmployeesCalc(regionProvider).calculate(companyFacts);
    };

    it('when employeesFractions array empty', async () => {
      companyFacts.employeesFractions = [];
      const employeesCalcResults = await calc(companyFacts);
      expect(employeesCalcResults.itucAverage).toBeCloseTo(0);
    });

    it('when employeesFractions array has size 1', async () => {
      companyFacts.employeesFractions = [
        new EmployeesFraction(undefined, 'CRI', 3),
      ];
      const employeesCalcResults = await calc(companyFacts);
      expect(employeesCalcResults.itucAverage).toBeCloseTo(9);
    });

    it('when employeesFractions array has size > 1', async () => {
      companyFacts.employeesFractions = [
        new EmployeesFraction(undefined, 'CRI', 3),
        new EmployeesFraction(undefined, 'CHN', 2),
      ];
      const employeesCalcResults = await calc(companyFacts);
      expect(employeesCalcResults.itucAverage).toBeCloseTo(19);
    });
  });

  describe('should calculate the company size ', () => {
    let companyFacts: CompanyFacts;
    let regionProvider: RegionProvider;
    const mio = 1000000;
    const companySizeIs = (companySize: CompanySize) => {
      const employeesCalc: EmployeesCalcResults = new EmployeesCalc(
        regionProvider
      ).calculate(companyFacts);
      expect(employeesCalc.companySize).toBe(companySize);
    };
    beforeEach(async () => {
      companyFacts = EmptyCompanyFacts;
      regionProvider = await RegionProvider.createFromCompanyFacts(
        companyFacts,
        connection.getRepository(Region)
      );
    });

    describe('when turnover and totalAssets are 2mio ', () => {
      beforeEach(() => {
        companyFacts.turnover = 2 * mio;
        companyFacts.totalAssets = 2 * mio;
      });

      it('and FTE < 10 -> micro', async () => {
        companyFacts.numberOfEmployees = 9;
        companySizeIs(CompanySize.micro);
      });

      it('and FTE = 10 -> small', async () => {
        companyFacts.numberOfEmployees = 10;
        companySizeIs(CompanySize.small);
      });

      it('and FTE = 50 -> middle', async () => {
        companyFacts.numberOfEmployees = 50;
        companySizeIs(CompanySize.middle);
      });

      it('and FTE = 250 -> large', async () => {
        companyFacts.numberOfEmployees = 250;
        companySizeIs(CompanySize.large);
      });
    });

    describe('when FTE = 9 and totalAssets = 2 Mio', () => {
      beforeEach(() => {
        companyFacts.numberOfEmployees = 9;
        companyFacts.totalAssets = 2 * mio;
      });

      it('and turnover = 2 Mio -> micro', async () => {
        companyFacts.turnover = 2 * mio;
        companySizeIs(CompanySize.micro);
      });

      it('and turnover = 10 Mio -> micro', async () => {
        companyFacts.turnover = 10 * mio;
        companySizeIs(CompanySize.micro);
      });

      it('and turnover = 50 Mio -> micro', async () => {
        companyFacts.turnover = 50 * mio;
        companySizeIs(CompanySize.micro);
      });

      it('and turnover = 51 Mio -> micro', async () => {
        companyFacts.turnover = 51 * mio;
        companySizeIs(CompanySize.micro);
      });
    });

    describe('when FTE = 9 and turnover = 2 Mio', () => {
      beforeEach(() => {
        companyFacts.numberOfEmployees = 9;
        companyFacts.turnover = 2 * mio;
      });

      it('and totalAssets = 2 Mio -> micro', async () => {
        companyFacts.totalAssets = 2 * mio;
        companySizeIs(CompanySize.micro);
      });

      it('and totalAssets = 10 Mio -> micro', async () => {
        companyFacts.totalAssets = 10 * mio;
        companySizeIs(CompanySize.micro);
      });

      it('and totalAssets = 43 Mio -> micro', async () => {
        companyFacts.totalAssets = 43 * mio;
        companySizeIs(CompanySize.micro);
      });

      it('and totalAssets = 44 Mio -> micro', async () => {
        companyFacts.totalAssets = 44 * mio;
        companySizeIs(CompanySize.micro);
      });
    });

    describe('when FTE = 9', () => {
      beforeEach(() => {
        companyFacts.numberOfEmployees = 9;
      });

      it('and both totalAssets and turnover are 2 Mio -> micro', async () => {
        companyFacts.totalAssets = 2 * mio;
        companyFacts.turnover = 2 * mio;
        companySizeIs(CompanySize.micro);
      });

      it('and both totalAssets and turnover are 10 Mio -> small', async () => {
        companyFacts.totalAssets = 10 * mio;
        companyFacts.turnover = 10 * mio;
        companySizeIs(CompanySize.small);
      });

      it('and both totalAssets and turnover >= 43 Mio -> middle', async () => {
        companyFacts.totalAssets = 43 * mio;
        companyFacts.turnover = 50 * mio;
        companySizeIs(CompanySize.middle);
      });

      it('and both totalAssets and turnover > 50 Mio -> large', async () => {
        companyFacts.totalAssets = 51 * mio;
        companyFacts.turnover = 51 * mio;
        companySizeIs(CompanySize.large);
      });
    });
  });
});
