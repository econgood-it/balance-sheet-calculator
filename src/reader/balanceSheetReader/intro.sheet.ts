import { Worksheet } from 'exceljs';
import { CellReader } from './cell.reader';
import { BalanceSheetVersion } from '@ecogood/e-calculator-schemas/dist/shared.schemas';

export class IntroSheet {
  private balanceSheetVersion: BalanceSheetVersion;
  constructor(sheet: Worksheet) {
    this.balanceSheetVersion = new CellReader()
      .read(sheet, 3, 'C')
      .parseAsVersion();
  }

  public getBalanceSheetVersion() {
    return this.balanceSheetVersion;
  }
}
