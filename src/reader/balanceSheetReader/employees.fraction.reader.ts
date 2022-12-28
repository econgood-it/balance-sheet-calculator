import { Row } from 'exceljs';
import { CellReader } from './cell.reader';
import { EmployeesFraction } from '../../models/company.facts';

export class EmployeesFractionReader {
  public read(row: Row): EmployeesFraction | undefined {
    const cr = new CellReader();
    const percentage = cr.readWithRow(row, 'D').percentage;
    return percentage > 0
      ? {
          countryCode: cr.readWithRow(row, 'B').countryCode,
          percentage,
        }
      : undefined;
  }
}
