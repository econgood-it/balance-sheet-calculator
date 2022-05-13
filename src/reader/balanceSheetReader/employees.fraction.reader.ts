import { Row } from 'exceljs';
import { EmployeesFraction } from '../../entities/employeesFraction';
import { CellReader } from './cell.reader';

export class EmployeesFractionReader {
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
