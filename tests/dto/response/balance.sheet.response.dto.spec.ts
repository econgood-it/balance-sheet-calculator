import { BalanceSheetDTOResponse } from '../../../src/dto/response/balance.sheet.response.dto';
import { balanceSheetFactory } from '../../testData/balance.sheet';
import { Rating } from '../../../src/models/balance.sheet';

jest.mock('../../../src/i18n', () => ({
  init: () => {},
  use: () => {},
  t: (k: string) => 'Menschenwürde in der Zulieferkette',
}));

describe('BalanceSheetResponseDTO', () => {
  it('is created from balance sheet', async () => {
    const ratings: Rating[] = [
      {
        shortName: 'A1',
        name: 'v5:compact.A1',
        estimations: 2,
        points: 3,
        maxPoints: 51,
        weight: 5,
        isWeightSelectedByUser: true,
        isPositive: true,
      },
      {
        shortName: 'A1.1',
        name: 'v5:compact.A1.1',
        estimations: 2,
        points: 3,
        maxPoints: 51,
        weight: 5,
        isWeightSelectedByUser: true,
        isPositive: true,
      },
      {
        shortName: 'A2',
        name: 'v5:compact.A2',
        estimations: 2,
        points: 3,
        maxPoints: 51,
        weight: 5,
        isWeightSelectedByUser: true,
        isPositive: true,
      },
    ];
    const balanceSheet = {
      ...(await balanceSheetFactory.emptyV508()),
      ratings: ratings,
    };
    const balanceSheetDTO = BalanceSheetDTOResponse.fromBalanceSheet(
      undefined,
      balanceSheet,
      'en'
    );
    expect(balanceSheetDTO).toBeDefined();
    expect(balanceSheetDTO.ratings).toMatchObject([
      {
        shortName: 'A1',
        name: 'Menschenwürde in der Zulieferkette',
      },
      { shortName: 'A1.1' },
      {
        shortName: 'A2',
      },
    ]);
  });
});
