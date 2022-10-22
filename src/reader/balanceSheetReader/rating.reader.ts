import { Row } from 'exceljs';
import { CellReader } from './cell.reader';
import { isTopicShortName, Rating } from '../../models/balance.sheet';

export class RatingReader {
  public read(row: Row): Rating | undefined {
    const cr = new CellReader();
    const shortName = cr.readWithRow(row, 'B').text;
    const nameValue = cr.readWithRow(row, 'C');
    const estimations = cr.readWithRow(row, 'H').numberWithDefault0;
    const points = cr.readWithRow(row, 'I').numberWithDefault0;
    const maxPoints = cr.readWithRow(row, 'J').number;
    return shortName.length > 1
      ? {
          shortName: shortName,
          name: nameValue.text,
          estimations: this.estimations(
            estimations,
            shortName,
            points,
            maxPoints
          ),
          points: points,
          maxPoints: maxPoints,
          weight: cr.readWithRow(row, 'D').weight,
          isWeightSelectedByUser: cr.readWithRow(row, 'N')
            .isWeightSelectedByUser,
          isPositive: nameValue.isPositiveAspect,
        }
      : undefined;
  }

  private estimations(
    value: number,
    shortName: string,
    points: number,
    maxPoinst: number
  ): number {
    if (isTopicShortName(shortName)) {
      return maxPoinst > 0 ? points / maxPoinst : 0;
    }
    return value;
  }
}
