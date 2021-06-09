import { RatingFactory } from '../../../src/factories/rating.factory';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '../../../src/entities/enums';
import { MatrixDTO } from '../../../src/dto/matrix/matrix.dto';
import { Rating } from '../../../src/entities/rating';

describe('Matrix DTO', () => {
  let rating: Rating;

  beforeEach(async () => {
    rating = await RatingFactory.createDefaultRating(
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_4
    );
  });

  it('is created from rating', async () => {
    const matrixDTO = MatrixDTO.fromRating(rating, 'en');
    expect(matrixDTO).toBeDefined();
  });

  it('has a topics array of 20', async () => {
    const matrixDTO = MatrixDTO.fromRating(rating, 'en');
    expect(matrixDTO.topics).toHaveLength(20);
  });

  it('has topic A1 with 30 of 50 reached points', async () => {
    rating.topics[0].points = 30;
    rating.topics[0].maxPoints = 50;
    const matrixDTO = MatrixDTO.fromRating(rating, 'en');
    expect(matrixDTO.topics[0].points).toBe(30);
    expect(matrixDTO.topics[0].maxPoints).toBe(50);
  });

  it('has topic E4 with 20 of 60 reached points', async () => {
    rating.topics[0].points = 20;
    rating.topics[0].maxPoints = 60;
    const matrixDTO = MatrixDTO.fromRating(rating, 'en');
    expect(matrixDTO.topics[0].points).toBe(20);
    expect(matrixDTO.topics[0].maxPoints).toBe(60);
  });
});
