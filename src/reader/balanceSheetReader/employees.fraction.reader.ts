import { Row } from 'exceljs';
import { CellReader } from './cell.reader';
import { EmployeesFraction } from '../../models/company.facts';
import { DEFAULT_COUNTRY_CODE } from '../../models/region';

export class EmployeesFractionReader {
  public read(row: Row): EmployeesFraction | undefined {
    const cr = new CellReader();
    const percentage = cr.readWithRow(row, 'D').percentage;
    // TODO: Instead of a default country code a missing countryCode should be okey
    return percentage > 0
      ? {
          countryCode:
            cr.readWithRow(row, 'B').countryCode || DEFAULT_COUNTRY_CODE,
          percentage,
        }
      : undefined;
  }
}
