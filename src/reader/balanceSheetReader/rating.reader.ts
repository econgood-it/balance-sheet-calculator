import { Row } from 'exceljs';
import { Translations } from '../../entities/Translations';
import { isTopic, Rating } from '../../entities/rating';
import { CellReader } from './cell.reader';

export class RatingReader {
  public read(row: Row, lng: keyof Translations): Rating | undefined {
    const cr = new CellReader();
    const shortName = cr.readWithRow(row, 'B').text;
    const nameValue = cr.readWithRow(row, 'C');
    const estimations = cr.readWithRow(row, 'H').numberWithDefault0;
    const points = cr.readWithRow(row, 'I').numberWithDefault0;
    const maxPoints = cr.readWithRow(row, 'J').number;
    return shortName.length > 1
      ? new Rating(
          undefined,
          shortName,
          nameValue.text,
          this.estimations(estimations, shortName, points, maxPoints),
          points,
          maxPoints,
          cr.readWithRow(row, 'D').weight,
          cr.readWithRow(row, 'N').isWeightSelectedByUser,
          nameValue.isPositiveAspect
        )
      : undefined;
  }

  private estimations(
    value: number,
    shortName: string,
    points: number,
    maxPoinst: number
  ): number {
    if (isTopic(shortName)) {
      return maxPoinst > 0 ? points / maxPoinst : 0;
    }
    return value;
  }
}
