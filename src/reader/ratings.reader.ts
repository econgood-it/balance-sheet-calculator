import { Workbook, Row, Worksheet } from 'exceljs';
import { Rating } from '../models/balance.sheet';

interface Headers {
  shortNameIndex: number;
  nameIndex: number;
  weightIndex: number;
  estimationIndex: number;
  pointsIndex: number;
  maxPointsIndex: number;
  isWeightSelectedByUserIndex: number;
  isPositive: number;
}

export class RatingsReader {
  private static readonly DEFAULT_HEADERS: Headers = {
    shortNameIndex: 1,
    nameIndex: 2,
    weightIndex: 3,
    isWeightSelectedByUserIndex: 4,
    estimationIndex: 5,
    pointsIndex: 6,
    maxPointsIndex: 7,
    isPositive: 8,
  };

  public async readRatingsFromCsv(
    path: string,
    headers: Headers = RatingsReader.DEFAULT_HEADERS
  ): Promise<Rating[]> {
    const wb: Workbook = new Workbook();
    const sheet: Worksheet = await wb.csv.readFile(path, {
      parserOptions: { delimiter: ',' },
    });

    const ratings: Rating[] = [];
    let rowIndex = 2;
    while (true) {
      const row: Row = sheet.getRow(rowIndex);
      const shortName = row.getCell(headers.shortNameIndex).text;
      if (shortName === '') {
        return ratings;
      }
      if (shortName.length >= 2) {
        ratings.push(this.readRating(row, headers));
      }
      rowIndex += 1;
    }
  }

  private readRating(row: Row, headers: Headers): Rating {
    const shortName = row.getCell(headers.shortNameIndex).text;
    const name = row.getCell(headers.nameIndex).text;
    const estimations = Number(row.getCell(headers.estimationIndex).text);
    const weightAsStr = row.getCell(headers.weightIndex).text;
    const isWeightSelectedByUser =
      row.getCell(headers.isWeightSelectedByUserIndex).text.toLowerCase() ===
      'true';
    const isPositive = this.stringToBool(row.getCell(headers.isPositive).text);
    return {
      shortName: shortName,
      name: name,
      estimations: estimations,
      points: Number(row.getCell(headers.pointsIndex).text),
      maxPoints: Number(row.getCell(headers.maxPointsIndex).text),
      weight: Number(weightAsStr),
      isWeightSelectedByUser: isWeightSelectedByUser,
      isPositive: isPositive,
    };
  }

  private stringToBool(str: string) {
    return str.toLowerCase() === 'true';
  }
}
