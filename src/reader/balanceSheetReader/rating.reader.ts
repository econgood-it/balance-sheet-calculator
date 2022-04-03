import { Row } from 'exceljs';
import { Translations } from '../../entities/Translations';
import { Rating } from '../../entities/rating';
import { CellReader } from './cell.reader';

export class RatingReader {
  public read(row: Row, lng: keyof Translations): Rating | undefined {
    const cr = new CellReader();
    const shortName = cr.readWithRow(row, 'B').text;
    const nameValue = cr.readWithRow(row, 'C');
    return shortName.length > 1
      ? new Rating(
          undefined,
          shortName,
          nameValue.text,
          cr.readWithRow(row, 'H').number,
          cr.readWithRow(row, 'I').points,
          cr.readWithRow(row, 'J').number,
          cr.readWithRow(row, 'D').weight,
          cr.readWithRow(row, 'N').isWeightSelectedByUser,
          nameValue.isPositiveAspect
        )
      : undefined;
  }
}
