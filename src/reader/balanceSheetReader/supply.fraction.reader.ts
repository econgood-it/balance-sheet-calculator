import { Row } from 'exceljs';
import { SupplyFraction } from '../../entities/supplyFraction';
import { CellReader } from './cell.reader';

export class SupplyFractionReader {
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
