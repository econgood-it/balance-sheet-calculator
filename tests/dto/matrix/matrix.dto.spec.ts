import { RatingsFactory } from '../../../src/factories/ratings.factory';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '../../../src/entities/enums';
import { MatrixDTO } from '../../../src/dto/matrix/matrix.dto';
import { BalanceSheet } from '../../../src/entities/balanceSheet';
import { EmptyCompanyFacts } from '../../testData/company.facts';

describe('Matrix DTO', () => {
  let balanceSheet: BalanceSheet;

  beforeEach(async () => {
    const ratings = await RatingsFactory.createDefaultRatings(
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_4
    );
    balanceSheet = new BalanceSheet(
      undefined,
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_6,
      EmptyCompanyFacts,
      ratings,
      []
    );
  });

  it('is created from rating', async () => {
    const matrixDTO = MatrixDTO.fromBalanceSheet(balanceSheet, 'en');
    expect(matrixDTO).toBeDefined();
  });

  it('has a topics array of 20', async () => {
    const matrixDTO = MatrixDTO.fromBalanceSheet(balanceSheet, 'en');
    expect(matrixDTO.ratings).toHaveLength(20);
  });

  it('has topic A1 with 30 of 50 reached points', async () => {
    balanceSheet.ratings[0].points = 30;
    balanceSheet.ratings[0].maxPoints = 50;
    const matrixDTO = MatrixDTO.fromBalanceSheet(balanceSheet, 'en');
    expect(matrixDTO.ratings[0].points).toBe(30);
    expect(matrixDTO.ratings[0].maxPoints).toBe(50);
  });

  it('has topic E4 with 20 of 60 reached points', async () => {
    balanceSheet.ratings[0].points = 20;
    balanceSheet.ratings[0].maxPoints = 60;
    const matrixDTO = MatrixDTO.fromBalanceSheet(balanceSheet, 'en');
    expect(matrixDTO.ratings[0].points).toBe(20);
    expect(matrixDTO.ratings[0].maxPoints).toBe(60);
  });
});
