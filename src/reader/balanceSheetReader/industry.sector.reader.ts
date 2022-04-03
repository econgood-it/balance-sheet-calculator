import { Row } from 'exceljs';
import { Translations } from '../../entities/Translations';
import { IndustrySector } from '../../entities/industry.sector';
import { CellReader } from './cell.reader';

export class IndustrySectorReader {
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
