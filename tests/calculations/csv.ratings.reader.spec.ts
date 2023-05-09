import * as path from 'path';
import { CsvRatingsReader } from './csv.ratings.reader';
import { Rating } from '../../src/models/rating';

describe('RatingsReader', () => {
  it('should read ratings from csv', async () => {
    const ratingsReader = new CsvRatingsReader();
    const pathToCsv = path.join(__dirname, 'rating.csv');
    const ratings: Rating[] = await ratingsReader.readRatingsFromCsv(pathToCsv);
    expect(ratings[0]).toMatchObject({
      shortName: 'A1',
      name: 'Human dignity in the supply chain',
      weight: 1,
      isWeightSelectedByUser: false,
      estimations: 4,
      points: 20.4,
      maxPoints: 51,
      isPositive: true,
    });
    expect(ratings[1]).toMatchObject({
      shortName: 'A1.1',
      name: 'Working conditions and social impact in the supply chain',
      weight: 1,
      isWeightSelectedByUser: false,
      estimations: 2,
      points: 10.2,
      maxPoints: 51,
      isPositive: true,
    });
    expect(ratings[2]).toMatchObject({
      shortName: 'A1.2',
      name: 'Negative aspect: violation of human dignity in the supply chain',
      weight: 1,
      isWeightSelectedByUser: false,
      estimations: -3,
      points: -30.4,
      maxPoints: -170.212765957447,
      isPositive: false,
    });
    expect(ratings[7]).toMatchObject({
      shortName: 'A3',
      name: 'Environmental sustainability in the supply chain',
      weight: 2,
      isWeightSelectedByUser: true,
      estimations: 5,
      points: 50,
      maxPoints: 100,
      isPositive: true,
    });
    expect(ratings[8]).toMatchObject({
      shortName: 'A3.1',
      name: 'Environmental impact throughout the supply chain',
      weight: 1.5,
      isWeightSelectedByUser: true,
      estimations: 7,
      points: 30,
      maxPoints: 51,
      isPositive: true,
    });
    expect(ratings[9]).toMatchObject({
      shortName: 'A3.2',
      name: 'Negative aspect: disproportionate environmental impact throughout the supply chain',
      weight: 1,
      isWeightSelectedByUser: false,
      estimations: -5,
      points: -150,
      maxPoints: -200,
      isPositive: false,
    });
  });
});
