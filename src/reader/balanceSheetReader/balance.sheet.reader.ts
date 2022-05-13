import { Workbook } from 'exceljs';
import { CompanyFacts } from '../../entities/companyFacts';
import { MainOriginOfOtherSuppliers } from '../../entities/main.origin.of.other.suppliers';
import { BalanceSheet } from '../../entities/balanceSheet';
import { BalanceSheetType } from '../../entities/enums';
import { Translations } from '../../entities/Translations';
import { User } from '../../entities/user';
import { CellReader } from './cell.reader';
import { SupplyFractionReader } from './supply.fraction.reader';
import { EmployeesFractionReader } from './employees.fraction.reader';
import { IndustrySectorReader } from './industry.sector.reader';
import { RatingReader } from './rating.reader';

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
  public readFromWorkbook(
    wb: Workbook,
    language: keyof Translations,
    users: User[]
  ) {
    const cr = new CellReader();
    const sheet = wb.getWorksheet('2. Company Facts');
    const introSheet = wb.getWorksheet('0. Intro');
    const supplyFractionReader = new SupplyFractionReader();
    const employeesFractionReader = new EmployeesFractionReader();
    const industrySectorReader = new IndustrySectorReader();
    const valueColumn = 'C';
    const companyFacts = new CompanyFacts(
      undefined,
      cr.read(sheet, 7, valueColumn).number,
      cr.read(sheet, 27, valueColumn).number,
      cr.read(sheet, 18, valueColumn).number,
      cr.read(sheet, 19, valueColumn).number,
      cr.read(sheet, 20, valueColumn).number,
      cr.read(sheet, 22, valueColumn).number,
      cr.read(sheet, 37, valueColumn).numberWithDefault0,
      cr.read(sheet, 21, valueColumn).number,
      cr.read(sheet, 23, valueColumn).number,
      cr.read(sheet, 26, valueColumn).number,
      cr.read(sheet, 26, valueColumn).boolean,
      cr.read(sheet, 33, valueColumn).number,
      cr.read(sheet, 38, valueColumn).boolean,
      filterUndef(
        range(10, 14).map((row) => supplyFractionReader.read(sheet.getRow(row)))
      ),
      filterUndef(
        range(30, 32).map((row) =>
          employeesFractionReader.read(sheet.getRow(row))
        )
      ),
      filterUndef(
        range(41, 43).map((row) =>
          industrySectorReader.read(sheet.getRow(row), language)
        )
      ),
      new MainOriginOfOtherSuppliers(
        undefined,
        cr.read(sheet, 15, 'D').countryCode,
        cr.read(sheet, 15, 'F').numberWithDefault0
      )
    );
    const ratingReader = new RatingReader();
    const calcSheet = wb.getWorksheet('3. Calc');
    const ratings = filterUndef(
      range(9, 93).map((row) =>
        ratingReader.read(calcSheet.getRow(row), language)
      )
    );
    // TODO: Find a good way to distinguish between balance sheet types. Instead of hard coding Full.
    return new BalanceSheet(
      undefined,
      BalanceSheetType.Full,
      cr.read(introSheet, 3, 'C').parseAsVersion(),
      companyFacts,
      ratings,
      users
    );
  }
}
