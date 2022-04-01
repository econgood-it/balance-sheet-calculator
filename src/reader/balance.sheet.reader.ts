import { Row, Workbook, Worksheet } from 'exceljs';
import { CompanyFacts } from '../entities/companyFacts';
import { MainOriginOfOtherSuppliers } from '../entities/main.origin.of.other.suppliers';
import { SupplyFraction } from '../entities/supplyFraction';
import { BalanceSheet } from '../entities/balanceSheet';
import { BalanceSheetType, BalanceSheetVersion } from '../entities/enums';
import { EmployeesFraction } from '../entities/employeesFraction';
import { IndustrySector } from '../entities/industry.sector';
import { createTranslations, Translations } from '../entities/Translations';
import { Rating } from '../entities/rating';

class Value {
  constructor(public readonly value: string) {}

  public get text(): string {
    return this.value;
  }

  public get number(): number {
    return Number.parseFloat(this.value);
  }

  public get boolean(): boolean {
    switch (this.value) {
      case 'yes':
        return true;
      case 'ja':
        return true;
      default:
        return false;
    }
  }

  public get percentage(): number {
    return this.number;
  }

  public get countryCode(): string {
    return this.splitAndGetFirst(' ');
  }

  public get industryCode(): string {
    return this.splitAndGetFirst('-');
  }

  public get isWeightSelectedByUser(): boolean {
    return (
      this.value.startsWith('Weighting changed') ||
      this.value.startsWith('Gewichtung geändert')
    );
  }

  public get isPositiveAspect(): boolean {
    return !this.value.startsWith('Negativ');
  }

  public get weight(): number {
    return this.getNumberWithDefault(1);
  }

  public get points(): number {
    return this.getNumberWithDefault(0);
  }

  public getDescription(lng: keyof Translations) {
    return createTranslations(lng, this.value);
  }

  private splitAndGetFirst(splitBy: string): string {
    return this.value.split(splitBy)[0].trim();
  }

  private getNumberWithDefault(defaultValue: number): number {
    return !isNaN(this.number) ? this.number : defaultValue;
  }
}

class CellReader {
  public read(sheet: Worksheet, row: number, column: string): Value {
    return this.readWithRow(sheet.getRow(row), column);
  }

  public readWithRow(row: Row, column: string): Value {
    return new Value(row.getCell(column).text);
  }
}

class SupplyFractionReader {
  public read(row: Row): SupplyFraction | undefined {
    const cr = new CellReader();
    const costs = cr.readWithRow(row, 'F').number;
    return costs > 0
      ? new SupplyFraction(
          undefined,
          cr.readWithRow(row, 'B').industryCode,
          cr.readWithRow(row, 'D').countryCode,
          costs
        )
      : undefined;
  }
}

class EmployeesFractionReader {
  public read(row: Row): EmployeesFraction | undefined {
    const cr = new CellReader();
    const percentage = cr.readWithRow(row, 'D').percentage;
    return percentage > 0
      ? new EmployeesFraction(
          undefined,
          cr.readWithRow(row, 'B').countryCode,
          percentage
        )
      : undefined;
  }
}

class IndustrySectorReader {
  public read(row: Row, lng: keyof Translations): IndustrySector | undefined {
    const cr = new CellReader();
    const amountOfTotalTurnover = cr.readWithRow(row, 'D').percentage;
    return amountOfTotalTurnover > 0
      ? new IndustrySector(
          undefined,
          cr.readWithRow(row, 'B').industryCode,
          amountOfTotalTurnover,
          cr.readWithRow(row, 'C').getDescription(lng)
        )
      : undefined;
  }
}

class RatingReader {
  public read(row: Row, lng: keyof Translations): Rating | undefined {
    const cr = new CellReader();
    const shortName = cr.readWithRow(row, 'B').text;
    const nameValue = cr.readWithRow(row, 'C');
    return shortName.length > 1
      ? new Rating(
          undefined,
          shortName,
          nameValue.text,
          cr.readWithRow(row, 'H').number,
          cr.readWithRow(row, 'I').points,
          cr.readWithRow(row, 'J').number,
          cr.readWithRow(row, 'D').weight,
          cr.readWithRow(row, 'N').isWeightSelectedByUser,
          nameValue.isPositiveAspect
        )
      : undefined;
  }
}

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
  public readFromWorkbook(wb: Workbook, language: keyof Translations) {
    const cr = new CellReader();
    const sheet = wb.getWorksheet('2. Company Facts');

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
      cr.read(sheet, 37, valueColumn).number,
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
        cr.read(sheet, 15, 'F').number
      )
    );
    const ratingReader = new RatingReader();
    const calcSheet = wb.getWorksheet('3. Calc');
    const ratings = filterUndef(
      range(9, 93).map((row) =>
        ratingReader.read(calcSheet.getRow(row), language)
      )
    );
    return new BalanceSheet(
      undefined,
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_6,
      companyFacts,
      ratings,
      []
    );
  }
}
