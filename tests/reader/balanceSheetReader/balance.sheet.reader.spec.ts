import * as path from 'path';
import { BalanceSheetReader } from '../../../src/reader/balanceSheetReader/balance.sheet.reader';
import { Workbook } from 'exceljs';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';

describe('BalanceSheetReader', () => {
  it('should read company facts from excel', async () => {
    const balanceSheetReader = new BalanceSheetReader();
    const pathToCsv = path.join(__dirname, 'full_5_0_6.xlsx');
    const wb: Workbook = await new Workbook().xlsx.readFile(pathToCsv);

    const balancesheet = balanceSheetReader.readFromWorkbook(wb);
    const companyFacts = balancesheet.companyFacts;
    expect(companyFacts.totalPurchaseFromSuppliers).toBe(200000);
    expect(companyFacts.profit).toBe(456456456);
    expect(companyFacts.financialCosts).toBe(266);
    expect(companyFacts.incomeFromFinancialInvestments).toBe(500);
    expect(companyFacts.totalAssets).toBe(420);
    expect(companyFacts.additionsToFixedAssets).toBe(400);
    expect(companyFacts.financialAssetsAndCashBalance).toBe(310);
    expect(companyFacts.numberOfEmployees).toBe(5);
    expect(companyFacts.totalStaffCosts).toBe(5501);

    expect(companyFacts.supplyFractions).toHaveLength(4);
    expect(companyFacts.supplyFractions).toContainEqual({
      industryCode: 'Ca',
      countryCode: 'AFG',
      costs: 654,
    });

    expect(companyFacts.employeesFractions).toHaveLength(2);
    expect(companyFacts.employeesFractions).toContainEqual({
      countryCode: 'BHR',
      percentage: 0.11,
    });

    expect(companyFacts.averageJourneyToWorkForStaffInKm).toBe(456456);
    expect(companyFacts.hasCanteen).toBeFalsy();
    expect(companyFacts.turnover).toBe(124);
    expect(companyFacts.isB2B).toBeTruthy();

    expect(companyFacts.industrySectors).toHaveLength(2);
    expect(companyFacts.industrySectors).toContainEqual({
      industryCode: 'Ce',
      amountOfTotalTurnover: 0.13,
      description: 'abc',
    });

    expect(companyFacts.mainOriginOfOtherSuppliers).toMatchObject({
      countryCode: 'QAT',
      costs: 195425,
    });
  });

  it('should read ratings from excel', async () => {
    const balanceSheetReader = new BalanceSheetReader();
    const pathToCsv = path.join(__dirname, 'full_5_0_6.xlsx');
    const wb: Workbook = await new Workbook().xlsx.readFile(pathToCsv);
    const balancesheet = balanceSheetReader.readFromWorkbook(wb);
    const ratings = balancesheet.ratings;
    expect(ratings).toHaveLength(80);
    expect(ratings).toContainEqual({
      shortName: 'E3.2',
      name: 'Relative impact',
      estimations: 4,
      weight: 1.5,
      points: 11.7073170731707,
      maxPoints: 29.2682926829268,
      isPositive: true,
      isWeightSelectedByUser: true,
    });
  });

  it('should read version and type from excel', async () => {
    const balanceSheetReader = new BalanceSheetReader();
    const pathToCsv = path.join(__dirname, 'full_5_0_6.xlsx');
    const wb: Workbook = await new Workbook().xlsx.readFile(pathToCsv);
    const balancesheet = balanceSheetReader.readFromWorkbook(wb);
    expect(balancesheet.version).toBe(BalanceSheetVersion.v5_0_6);
    expect(balancesheet.type).toBe(BalanceSheetType.Full);
  });
});
