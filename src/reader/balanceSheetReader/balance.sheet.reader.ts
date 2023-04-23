import { Workbook } from 'exceljs';

import { CellReader } from './cell.reader';
import { SupplyFractionReader } from './supply.fraction.reader';
import { EmployeesFractionReader } from './employees.fraction.reader';
import { IndustrySectorReader } from './industry.sector.reader';
import { RatingReader } from './rating.reader';
import { Translations } from '../../language/translations';
import { BalanceSheetType } from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { BalanceSheetEntity } from '../../entities/balance.sheet.entity';
import { User } from '../../entities/user';

const range = (start: number, end: number): number[] =>
  Array.from(Array(end - start + 1).keys()).map((x) => x + start);

const filterUndef = <T>(ts: (T | undefined)[]): T[] => {
  return ts.filter((t: T | undefined): t is T => t !== undefined);
};

export const readLanguage = (workbook: Workbook): keyof Translations => {
  const introSheet = workbook.getWorksheet('0. Intro');
  const cr = new CellReader();
  const language = cr.read(introSheet, 1, 'B').text;
  switch (language) {
    case 'Deutsch':
      return 'de';
    default:
      return 'en';
  }
};

export class BalanceSheetReader {
  public readFromWorkbook(wb: Workbook, users: User[]): BalanceSheetEntity {
    const cr = new CellReader();
    const sheet = wb.getWorksheet('2. Company Facts');
    const introSheet = wb.getWorksheet('0. Intro');
    const supplyFractionReader = new SupplyFractionReader();
    const employeesFractionReader = new EmployeesFractionReader();
    const industrySectorReader = new IndustrySectorReader();
    const valueColumn = 'C';
    const companyFacts = {
      totalPurchaseFromSuppliers: cr.read(sheet, 7, valueColumn).number,
      totalStaffCosts: cr.read(sheet, 27, valueColumn).number,
      profit: cr.read(sheet, 18, valueColumn).number,
      financialCosts: cr.read(sheet, 19, valueColumn).number,
      incomeFromFinancialInvestments: cr.read(sheet, 20, valueColumn).number,
      additionsToFixedAssets: cr.read(sheet, 22, valueColumn).number,
      turnover: cr.read(sheet, 37, valueColumn).numberWithDefault0,
      totalAssets: cr.read(sheet, 21, valueColumn).number,
      financialAssetsAndCashBalance: cr.read(sheet, 23, valueColumn).number,
      numberOfEmployees: cr.read(sheet, 26, valueColumn).number,
      hasCanteen: cr.read(sheet, 26, valueColumn).parseAsOptionalBoolean(),
      averageJourneyToWorkForStaffInKm: cr.read(sheet, 33, valueColumn).number,
      isB2B: cr.read(sheet, 38, valueColumn).boolean,
      supplyFractions: filterUndef(
        range(10, 14).map((row) => supplyFractionReader.read(sheet.getRow(row)))
      ),
      employeesFractions: filterUndef(
        range(30, 32).map((row) =>
          employeesFractionReader.read(sheet.getRow(row))
        )
      ),
      industrySectors: filterUndef(
        range(41, 43).map((row) => industrySectorReader.read(sheet.getRow(row)))
      ),
      mainOriginOfOtherSuppliers: {
        countryCode: cr.read(sheet, 15, 'D').countryCode,
        costs: cr.read(sheet, 15, 'F').numberWithDefault0,
      },
    };
    const ratingReader = new RatingReader();
    const calcSheet = wb.getWorksheet('3. Calc');
    const ratings = filterUndef(
      range(9, 93).map((row) => ratingReader.read(calcSheet.getRow(row)))
    );
    // TODO: Find a good way to distinguish between balance sheet types. Instead of hard coding Full.
    return new BalanceSheetEntity(
      undefined,
      {
        type: BalanceSheetType.Full,
        version: cr.read(introSheet, 3, 'C').parseAsVersion(),
        companyFacts,
        ratings,
      },
      users
    );
  }
}
