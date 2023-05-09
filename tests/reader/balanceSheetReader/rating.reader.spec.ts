import { RatingReader } from '../../../src/reader/balanceSheetReader/rating.reader';
import { Workbook } from 'exceljs';

describe('RatingReader', () => {
  const columns = [
    {},
    { header: 'B', key: 'shortName' },
    { header: 'C', key: 'name' },
    { header: 'C', key: 'weight' },
    {},
    {},
    {},
    { header: 'H', key: 'estimations' },
    { header: 'I', key: 'points' },
    { header: 'J', key: 'maxPoints' },
    {},
    {},
    {},
    { header: 'N', key: 'isWeightSelectedByUser' },
  ];
  it('should read row as rating', function () {
    const ratingReader = new RatingReader();
    const workbook = new Workbook();
    workbook.addWorksheet('Sheet');
    const worksheet = workbook.getWorksheet('Sheet');
    worksheet.columns = columns;
    const row = {
      shortName: 'A1.1',
      name: 'A1.1 name',
      estimations: 4,
      points: 12,
      maxPoints: 51,
      weight: 1,
      isWeightSelectedByUser: 'Weighting changed',
      isPositive: true,
    };

    worksheet.addRow(row);
    const rating = ratingReader.read(worksheet.getRow(2));
    expect(rating).toEqual({ ...row, isWeightSelectedByUser: true });
  });
});
