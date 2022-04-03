import { Row, Worksheet } from 'exceljs';
import { Value } from './value';

export class CellReader {
  public read(sheet: Worksheet, row: number, column: string): Value {
    return this.readWithRow(sheet.getRow(row), column);
  }

  public readWithRow(row: Row, column: string): Value {
    return new Value(row.getCell(column).text);
  }
}
