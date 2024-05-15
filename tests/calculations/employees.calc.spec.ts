import { RegionProvider } from '../../src/providers/region.provider';

import { BalanceSheetVersion } from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import {
  CompanyFacts,
  makeCompanyFacts,
  makeEmployeesFraction,
} from '../../src/models/company.facts';
import {
  CompanySize,
  makeEmployeesCalc,
} from '../../src/calculations/employees.calc';

describe('Employees Calculator', () => {
  describe('should calculate the itucAverage ', () => {
    async function calc(companyFacts: CompanyFacts) {
      return makeEmployeesCalc(
        await RegionProvider.fromVersion(BalanceSheetVersion.v5_0_8)
      ).calculate(companyFacts);
    }

    it('when employeesFractions array empty', async () => {
      const companyFacts = makeCompanyFacts();
      const employeesCalcResults = await calc(companyFacts);
      expect(employeesCalcResults.itucAverage).toBeCloseTo(0);
    });

    it('when employeesFractions array has size 1', async () => {
      const companyFacts = makeCompanyFacts().withFields({
        employeesFractions: [
          makeEmployeesFraction({ countryCode: 'CRI', percentage: 0.7 }),
        ],
      });
      const employeesCalcResults = await calc(companyFacts);
      expect(employeesCalcResults.itucAverage).toBeCloseTo(1.4);
    });

    it('when employeesFractions contains item without country code', async () => {
      const companyFacts = makeCompanyFacts().withFields({
        employeesFractions: [makeEmployeesFraction({ percentage: 1 })],
      });
      const employeesCalcResults = await calc(companyFacts);
      expect(employeesCalcResults.itucAverage).toBeCloseTo(0);
    });

    it('when employeesFractions contains item with average country code like AAF', async () => {
      // TODO: EXCEL Limitation (see issue https://git.ecogood.org/services/balance-sheet-calculator/issues/138)
      const companyFacts = makeCompanyFacts().withFields({
        employeesFractions: [
          makeEmployeesFraction({ countryCode: 'AAF', percentage: 1 }),
        ],
      });
      const employeesCalcResults = await calc(companyFacts);
      expect(employeesCalcResults.itucAverage).toBeCloseTo(0);
    });

    it('when employeesFractions contains item with country code > LKA', async () => {
      // TODO: EXCEL Limitation (see issue https://git.ecogood.org/services/balance-sheet-calculator/issues/138)
      const companyFacts = makeCompanyFacts().withFields({
        employeesFractions: [
          makeEmployeesFraction({ countryCode: 'LSO', percentage: 1 }),
        ],
      });
      const employeesCalcResults = await calc(companyFacts);
      expect(employeesCalcResults.itucAverage).toBeCloseTo(0);
    });

    it('when employeesFractions array has size > 1', async () => {
      const companyFacts = makeCompanyFacts().withFields({
        employeesFractions: [
          makeEmployeesFraction({ countryCode: 'CRI', percentage: 0.7 }),
          makeEmployeesFraction({ countryCode: 'CHN', percentage: 0.2 }),
        ],
      });
      const employeesCalcResults = await calc(companyFacts);
      expect(employeesCalcResults.itucAverage).toBeCloseTo(2.4);
    });
  });

  describe('should calculate the company size ', () => {
    const mio = 1000000;
    async function companySizeIs(
      companySize: CompanySize,
      companyFacts: CompanyFacts
    ) {
      const employeesCalc = makeEmployeesCalc(
        await RegionProvider.fromVersion(BalanceSheetVersion.v5_0_8)
      );
      expect(employeesCalc.calculate(companyFacts).companySize).toBe(
        companySize
      );
    }

    describe('when turnover and totalAssets are 2mio ', () => {
      const companyFactsWithMioValues = makeCompanyFacts().withFields({
        turnover: 2 * mio,
        totalAssets: 2 * mio,
      });

      it('and FTE < 10 -> micro', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          numberOfEmployees: 9,
        };
        await companySizeIs(CompanySize.micro, companyFacts);
      });

      it('and FTE = 10 -> small', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          numberOfEmployees: 10,
        };
        companyFacts.numberOfEmployees = 10;
        await companySizeIs(CompanySize.small, companyFacts);
      });

      it('and FTE = 50 -> middle', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          numberOfEmployees: 50,
        };
        await companySizeIs(CompanySize.middle, companyFacts);
      });

      it('and FTE = 250 -> large', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          numberOfEmployees: 250,
        };
        await companySizeIs(CompanySize.large, companyFacts);
      });
    });

    describe('when FTE = 9 and totalAssets = 2 Mio', () => {
      const companyFactsWithMioValues = makeCompanyFacts().withFields({
        numberOfEmployees: 9,
        totalAssets: 2 * mio,
      });

      it('and turnover = 2 Mio -> micro', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          turnover: 2 * mio,
        };
        await companySizeIs(CompanySize.micro, companyFacts);
      });

      it('and turnover = 10 Mio -> micro', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          turnover: 10 * mio,
        };

        await companySizeIs(CompanySize.micro, companyFacts);
      });

      it('and turnover = 50 Mio -> micro', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          turnover: 50 * mio,
        };
        await companySizeIs(CompanySize.micro, companyFacts);
      });

      it('and turnover = 51 Mio -> micro', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          turnover: 51 * mio,
        };
        await companySizeIs(CompanySize.micro, companyFacts);
      });
    });

    describe('when FTE = 9 and turnover = 2 Mio', () => {
      const companyFactsWithMioValues = makeCompanyFacts().withFields({
        numberOfEmployees: 9,
        turnover: 2 * mio,
      });

      it('and totalAssets = 2 Mio -> micro', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          totalAssets: 2 * mio,
        };
        await companySizeIs(CompanySize.micro, companyFacts);
      });

      it('and totalAssets = 10 Mio -> micro', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          totalAssets: 10 * mio,
        };
        await companySizeIs(CompanySize.micro, companyFacts);
      });

      it('and totalAssets = 43 Mio -> micro', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          totalAssets: 43 * mio,
        };

        await companySizeIs(CompanySize.micro, companyFacts);
      });

      it('and totalAssets = 44 Mio -> micro', async () => {
        const companyFacts = {
          ...companyFactsWithMioValues,
          totalAssets: 44 * mio,
        };
        await companySizeIs(CompanySize.micro, companyFacts);
      });
    });

    describe('when FTE = 9', () => {
      const companyFactsWith9Employees = makeCompanyFacts().withFields({
        numberOfEmployees: 9,
      });

      it('and both totalAssets and turnover are 2 Mio -> micro', async () => {
        const companyFacts = {
          ...companyFactsWith9Employees,
          totalAssets: 2 * mio,
          turnover: 2 * mio,
        };

        await companySizeIs(CompanySize.micro, companyFacts);
      });

      it('and both totalAssets and turnover are 10 Mio -> small', async () => {
        const companyFacts = {
          ...companyFactsWith9Employees,
          totalAssets: 10 * mio,
          turnover: 10 * mio,
        };

        await companySizeIs(CompanySize.small, companyFacts);
      });

      it('and both totalAssets and turnover >= 43 Mio -> middle', async () => {
        const companyFacts = {
          ...companyFactsWith9Employees,
          totalAssets: 43 * mio,
          turnover: 50 * mio,
        };
        companyFacts.totalAssets = 43 * mio;
        companyFacts.turnover = 50 * mio;
        await companySizeIs(CompanySize.middle, companyFacts);
      });

      it('and both totalAssets and turnover > 50 Mio -> large', async () => {
        const companyFacts = {
          ...companyFactsWith9Employees,
          totalAssets: 51 * mio,
          turnover: 51 * mio,
        };

        await companySizeIs(CompanySize.large, companyFacts);
      });
    });
  });

  describe('should calculate the normedEmployeesRisk ', () => {
    async function calc(companyFacts: CompanyFacts) {
      return makeEmployeesCalc(
        await RegionProvider.fromVersion(BalanceSheetVersion.v5_0_8)
      ).calculate(companyFacts);
    }

    it('when employeesFractions array empty', async () => {
      const companyFacts = makeCompanyFacts().withFields({
        totalStaffCosts: 8_999,
        employeesFractions: [
          makeEmployeesFraction({
            countryCode: 'AGO',
            percentage: 0.8,
          }),
        ],
      });

      const employeesCalcResults = await calc(companyFacts);
      expect(employeesCalcResults.normedEmployeesRisk).toBeCloseTo(
        16_188.335653275537,
        10
      );
    });
    it('when employeesFractions contains item without country code', async () => {
      const companyFacts = makeCompanyFacts().withFields({
        totalStaffCosts: 8_999,
        employeesFractions: [
          makeEmployeesFraction({
            countryCode: 'ALB',
            percentage: 0.8,
          }),
          makeEmployeesFraction({ percentage: 0.1 }),
        ],
      });
      const employeesCalcResults = await calc(companyFacts);
      expect(employeesCalcResults.normedEmployeesRisk).toBeCloseTo(
        20_746.732616115143,
        10
      );
    });

    it('when employeesFractions contains item with average country code like AEU', async () => {
      const companyFacts = makeCompanyFacts().withFields({
        totalStaffCosts: 8_999,
        employeesFractions: [
          makeEmployeesFraction({
            countryCode: 'ALB',
            percentage: 0.8,
          }),
          makeEmployeesFraction({ countryCode: 'AAF', percentage: 0.1 }),
        ],
      });
      const employeesCalcResults = await calc(companyFacts);
      expect(employeesCalcResults.normedEmployeesRisk).toBeCloseTo(
        22_106.9357191006,
        10
      );
    });
  });
});
