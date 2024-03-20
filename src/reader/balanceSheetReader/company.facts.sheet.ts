import { OldCompanyFacts } from '../../models/oldCompanyFacts';
import { filterUndef, range } from './reader.utils';
import { SupplyFractionReader } from './supply.fraction.reader';
import { EmployeesFractionReader } from './employees.fraction.reader';
import { IndustrySectorReader } from './industry.sector.reader';
import { CellReader } from './cell.reader';
import { Worksheet } from 'exceljs';

export class CompanyFactsSheet {
  private supplyFractionReader = new SupplyFractionReader();
  private employeesFractionReader = new EmployeesFractionReader();
  private industrySectorReader = new IndustrySectorReader();
  private cr = new CellReader();
  private valueColumn = 'C';
  constructor(private sheet: Worksheet) {}
  public toCompanyFacts(): OldCompanyFacts {
    return {
      totalPurchaseFromSuppliers: this.cr.read(this.sheet, 7, this.valueColumn)
        .number,
      totalStaffCosts: this.cr.read(this.sheet, 27, this.valueColumn)
        .numberWithDefault0,
      profit: this.cr.read(this.sheet, 18, this.valueColumn).number,
      financialCosts: this.cr.read(this.sheet, 19, this.valueColumn).number,
      incomeFromFinancialInvestments: this.cr.read(
        this.sheet,
        20,
        this.valueColumn
      ).number,
      additionsToFixedAssets: this.cr.read(this.sheet, 22, this.valueColumn)
        .number,
      turnover: this.cr.read(this.sheet, 37, this.valueColumn)
        .numberWithDefault0,
      totalAssets: this.cr.read(this.sheet, 21, this.valueColumn).number,
      financialAssetsAndCashBalance: this.cr.read(
        this.sheet,
        23,
        this.valueColumn
      ).number,
      numberOfEmployees: this.cr.read(this.sheet, 26, this.valueColumn)
        .numberWithDefault0,
      hasCanteen: this.cr
        .read(this.sheet, 34, this.valueColumn)
        .parseAsOptionalBoolean(),
      averageJourneyToWorkForStaffInKm: this.cr.read(
        this.sheet,
        33,
        this.valueColumn
      ).numberWithDefault0,
      isB2B: this.cr.read(this.sheet, 38, this.valueColumn).boolean,
      supplyFractions: filterUndef(
        range(10, 14).map((row) =>
          this.supplyFractionReader.read(this.sheet.getRow(row))
        )
      ),
      employeesFractions: filterUndef(
        range(30, 32).map((row) =>
          this.employeesFractionReader.read(this.sheet.getRow(row))
        )
      ),
      industrySectors: filterUndef(
        range(41, 43).map((row) =>
          this.industrySectorReader.read(this.sheet.getRow(row))
        )
      ),
      mainOriginOfOtherSuppliers: {
        countryCode: this.cr.read(this.sheet, 15, 'D').countryCode,
        costs: this.cr.read(this.sheet, 15, 'F').numberWithDefault0,
      },
    };
  }
}
