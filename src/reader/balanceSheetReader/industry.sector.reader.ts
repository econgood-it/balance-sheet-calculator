import { Row } from 'exceljs';

import { CellReader } from './cell.reader';
import { IndustrySector } from '../../models/balance.sheet';

export class IndustrySectorReader {
  public read(row: Row): IndustrySector | undefined {
    const cr = new CellReader();
    const amountOfTotalTurnover = cr.readWithRow(row, 'D').percentage;
    return amountOfTotalTurnover > 0
      ? {
          industryCode: cr.readWithRow(row, 'B').industryCode,
          amountOfTotalTurnover: amountOfTotalTurnover,
          description: cr.readWithRow(row, 'C').text,
        }
      : undefined;
  }
}
