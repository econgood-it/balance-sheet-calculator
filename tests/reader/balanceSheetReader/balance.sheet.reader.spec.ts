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
    const pathToCsv = path.join(__dirname, 'full_5_0_8.xlsx');
    const wb: Workbook = await new Workbook().xlsx.readFile(pathToCsv);

    const balanceSheetEntity = balanceSheetReader.readFromWorkbook(wb, []);
    const companyFacts = balanceSheetEntity.companyFacts;
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
    expect(companyFacts.hasCanteen).toBeDefined();
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
    const pathToCsv = path.join(__dirname, 'full_5_0_8.xlsx');
    const wb: Workbook = await new Workbook().xlsx.readFile(pathToCsv);
    const balanceSheetEntity = balanceSheetReader.readFromWorkbook(wb, []);
    const ratings = balanceSheetEntity.ratings;
    expect(ratings).toHaveLength(80);
    expect(ratings).toContainEqual({
      shortName: 'E3.2',
      name: 'Relative impact',
      estimations: 4,
      weight: 1.5,
      points: 11.428571428571427,
      maxPoints: 28.571428571428566,
      isPositive: true,
      isWeightSelectedByUser: true,
    });
  });

  it('should read version and type from excel', async () => {
    const balanceSheetReader = new BalanceSheetReader();
    const pathToCsv = path.join(__dirname, 'full_5_0_8.xlsx');
    const wb: Workbook = await new Workbook().xlsx.readFile(pathToCsv);
    const balanceSheetEntity = balanceSheetReader.readFromWorkbook(wb, []);
    expect(balanceSheetEntity.version).toBe(BalanceSheetVersion.v5_0_8);
    expect(balanceSheetEntity.type).toBe(BalanceSheetType.Full);
  });

  it('should read ratings from compact excel', async () => {
    const balanceSheetReader = new BalanceSheetReader();
    const pathToCsv = path.join(__dirname, 'compact_5_0_6.xlsx');
    const wb: Workbook = await new Workbook().xlsx.readFile(pathToCsv);

    const balanceSheetEntity = balanceSheetReader.readFromWorkbook(wb, []);
    expect(balanceSheetEntity.version).toBe(BalanceSheetVersion.v5_0_6);
    expect(balanceSheetEntity.type).toBe(BalanceSheetType.Compact);
    expect(balanceSheetEntity.ratings[1]).toEqual({
      shortName: 'A1.1',
      name: 'Human dignity in the supply chain',
      estimations: 0,
      points: 0,
      maxPoints: 50,
      weight: 1,
      isWeightSelectedByUser: false,
      isPositive: true,
    });
    expect(
      balanceSheetEntity.ratings[balanceSheetEntity.ratings.length - 1]
    ).toEqual({
      shortName: 'E4.2',
      name: 'Negative aspect: lack of transparency and wilful misinformation',
      estimations: 0,
      points: 0,
      maxPoints: -200,
      weight: 1,
      isWeightSelectedByUser: false,
      isPositive: false,
    });
  });
});
