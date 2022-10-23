import { Row } from 'exceljs';
import { CellReader } from './cell.reader';
import { SupplyFraction } from '../../models/company.facts';

export class SupplyFractionReader {
  public read(row: Row): SupplyFraction | undefined {
    const cr = new CellReader();
    const costs = cr.readWithRow(row, 'F').number;
    return costs > 0
      ? {
          industryCode: cr.readWithRow(row, 'B').industryCode,
          countryCode: cr.readWithRow(row, 'D').countryCode,
          costs,
        }
      : undefined;
  }
}
