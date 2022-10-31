import { MatrixDTO } from '../../../src/dto/matrix/matrix.dto';

import { BalanceSheet } from '../../../src/models/balance.sheet';
import { balanceSheetFactory } from '../../testData/balance.sheet';

describe('Matrix DTO', () => {
  let balanceSheet: BalanceSheet;

  beforeEach(async () => {
    balanceSheet = await balanceSheetFactory.emptyV508();
  });

  it('is created from rating', async () => {
    const matrixDTO = MatrixDTO.fromBalanceSheet(balanceSheet);
    expect(matrixDTO).toBeDefined();
  });

  it('has a topics array of 20', async () => {
    const matrixDTO = MatrixDTO.fromBalanceSheet(balanceSheet);
    expect(matrixDTO.ratings).toHaveLength(20);
  });

  it('has topic A1 with 30 of 50 reached points', async () => {
    balanceSheet.ratings[0].points = 30;
    balanceSheet.ratings[0].maxPoints = 50;
    const matrixDTO = MatrixDTO.fromBalanceSheet(balanceSheet);
    expect(matrixDTO.ratings[0].points).toBe(30);
    expect(matrixDTO.ratings[0].maxPoints).toBe(50);
  });

  it('has topic E4 with 20 of 60 reached points', async () => {
    balanceSheet.ratings[0].points = 20;
    balanceSheet.ratings[0].maxPoints = 60;
    const matrixDTO = MatrixDTO.fromBalanceSheet(balanceSheet);
    expect(matrixDTO.ratings[0].points).toBe(20);
    expect(matrixDTO.ratings[0].maxPoints).toBe(60);
  });
});
