import { RegionProvider } from '../../src/providers/region.provider';

import {
  CompanySize,
  EmployeesCalc,
  EmployeesCalcResults,
} from '../../src/calculations/employees.calc';

import { BalanceSheetVersion } from '../../src/models/balance.sheet';
import { companyFactsFactory } from '../testData/balance.sheet';
import { CompanyFacts } from '../../src/models/company.facts';

describe('Employees Calculator', () => {
  describe('should calculate the itucAverage ', () => {
    let regionProvider: RegionProvider;

    const calc = async (
      companyFacts: CompanyFacts
    ): Promise<EmployeesCalcResults> => {
      regionProvider = await RegionProvider.fromVersion(
        BalanceSheetVersion.v5_0_4
      );
      return new EmployeesCalc(regionProvider).calculate(companyFacts);
    };

    it('when employeesFractions array empty', async () => {
      const companyFacts = companyFactsFactory.empty();
      const employeesCalcResults = await calc(companyFacts);
      expect(employeesCalcResults.itucAverage).toBeCloseTo(0);
    });

    it('when employeesFractions array has size 1', async () => {
      const companyFacts: CompanyFacts = {
        ...companyFactsFactory.empty(),
        employeesFractions: [{ countryCode: 'CRI', percentage: 3 }],
      };
      const employeesCalcResults = await calc(companyFacts);
      expect(employeesCalcResults.itucAverage).toBeCloseTo(9);
    });

    it('when employeesFractions array has size > 1', async () => {
      const companyFacts: CompanyFacts = {
        ...companyFactsFactory.empty(),
        employeesFractions: [
          { countryCode: 'CRI', percentage: 3 },
          { countryCode: 'CHN', percentage: 2 },
        ],
      };
      const employeesCalcResults = await calc(companyFacts);
      expect(employeesCalcResults.itucAverage).toBeCloseTo(19);
    });
  });

  describe('should calculate the company size ', () => {
    let regionProvider: RegionProvider;
    const mio = 1000000;
    const companySizeIs = (
      companySize: CompanySize,
      companyFacts: CompanyFacts
    ) => {
      const employeesCalc: EmployeesCalcResults = new EmployeesCalc(
        regionProvider
      ).calculate(companyFacts);
      expect(employeesCalc.companySize).toBe(companySize);
    };
    beforeEach(async () => {
      regionProvider = await RegionProvider.fromVersion(
        BalanceSheetVersion.v5_0_4
      );
    });

    describe('when turnover and totalAssets are 2mio ', () => {
      const companyFactsWithMioValues = {
        ...companyFactsFactory.empty(),
        turnover: 2 * mio,
        totalAssets: 2 * mio,
      };

      it('and FTE < 10 -> micro', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          numberOfEmployees: 9,
        };
        companySizeIs(CompanySize.micro, companyFacts);
      });

      it('and FTE = 10 -> small', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          numberOfEmployees: 10,
        };
        companyFacts.numberOfEmployees = 10;
        companySizeIs(CompanySize.small, companyFacts);
      });

      it('and FTE = 50 -> middle', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          numberOfEmployees: 50,
        };
        companySizeIs(CompanySize.middle, companyFacts);
      });

      it('and FTE = 250 -> large', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          numberOfEmployees: 250,
        };
        companySizeIs(CompanySize.large, companyFacts);
      });
    });

    describe('when FTE = 9 and totalAssets = 2 Mio', () => {
      const companyFactsWithMioValues = {
        ...companyFactsFactory.empty(),
        numberOfEmployees: 9,
        totalAssets: 2 * mio,
      };

      it('and turnover = 2 Mio -> micro', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          turnover: 2 * mio,
        };
        companySizeIs(CompanySize.micro, companyFacts);
      });

      it('and turnover = 10 Mio -> micro', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          turnover: 10 * mio,
        };

        companySizeIs(CompanySize.micro, companyFacts);
      });

      it('and turnover = 50 Mio -> micro', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          turnover: 50 * mio,
        };
        companySizeIs(CompanySize.micro, companyFacts);
      });

      it('and turnover = 51 Mio -> micro', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          turnover: 51 * mio,
        };
        companySizeIs(CompanySize.micro, companyFacts);
      });
    });

    describe('when FTE = 9 and turnover = 2 Mio', () => {
      const companyFactsWithMioValues = {
        ...companyFactsFactory.empty(),
        numberOfEmployees: 9,
        turnover: 2 * mio,
      };

      it('and totalAssets = 2 Mio -> micro', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          totalAssets: 2 * mio,
        };
        companySizeIs(CompanySize.micro, companyFacts);
      });

      it('and totalAssets = 10 Mio -> micro', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          totalAssets: 10 * mio,
        };
        companySizeIs(CompanySize.micro, companyFacts);
      });

      it('and totalAssets = 43 Mio -> micro', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          totalAssets: 43 * mio,
        };

        companySizeIs(CompanySize.micro, companyFacts);
      });

      it('and totalAssets = 44 Mio -> micro', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          totalAssets: 44 * mio,
        };
        companySizeIs(CompanySize.micro, companyFacts);
      });
    });

    describe('when FTE = 9', () => {
      const companyFactsWith9Employees = {
        ...companyFactsFactory.empty(),
        numberOfEmployees: 9,
      };

      it('and both totalAssets and turnover are 2 Mio -> micro', async () => {
        const companyFacts = {
          ...companyFactsWith9Employees,
          totalAssets: 2 * mio,
          turnover: 2 * mio,
        };

        companySizeIs(CompanySize.micro, companyFacts);
      });

      it('and both totalAssets and turnover are 10 Mio -> small', async () => {
        const companyFacts = {
          ...companyFactsWith9Employees,
          totalAssets: 10 * mio,
          turnover: 10 * mio,
        };

        companySizeIs(CompanySize.small, companyFacts);
      });

      it('and both totalAssets and turnover >= 43 Mio -> middle', async () => {
        const companyFacts = {
          ...companyFactsWith9Employees,
          totalAssets: 43 * mio,
          turnover: 50 * mio,
        };
        companyFacts.totalAssets = 43 * mio;
        companyFacts.turnover = 50 * mio;
        companySizeIs(CompanySize.middle, companyFacts);
      });

      it('and both totalAssets and turnover > 50 Mio -> large', async () => {
        const companyFacts = {
          ...companyFactsWith9Employees,
          totalAssets: 51 * mio,
          turnover: 51 * mio,
        };

        companySizeIs(CompanySize.large, companyFacts);
      });
    });
  });

  describe('should calculate the normedEmployeesRisk ', () => {
    let regionProvider: RegionProvider;

    const calc = async (
      companyFacts: CompanyFacts
    ): Promise<EmployeesCalcResults> => {
      regionProvider = await RegionProvider.fromVersion(
        BalanceSheetVersion.v5_0_8
      );
      return new EmployeesCalc(regionProvider).calculate(companyFacts);
    };

    it('when employeesFractions array empty', async () => {
      const companyFacts: CompanyFacts = {
        ...companyFactsFactory.empty(),
        totalStaffCosts: 8_999,
        employeesFractions: [
          {
            countryCode: 'AGO',
            percentage: 0.8,
          },
        ],
      };

      const employeesCalcResults = await calc(companyFacts);
      expect(employeesCalcResults.normedEmployeesRisk).toBeCloseTo(
        16_188.335653275537,
        10
      );
    });
  });
});
