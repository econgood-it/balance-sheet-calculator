import { BalanceSheetDTOResponse } from '../../../src/dto/response/balance.sheet.response.dto';
import { balanceSheetFactory } from '../../testData/balance.sheet';
import { Rating } from '../../../src/models/rating';

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
        name: 'Human dignity in the supply chain',
        estimations: 2,
        points: 3,
        maxPoints: 51,
        weight: 5,
        isWeightSelectedByUser: true,
        isPositive: true,
      },
      {
        shortName: 'A1.1',
        name: 'Working conditions and social impact in the supply chain',
        estimations: 2,
        points: 3,
        maxPoints: 51,
        weight: 5,
        isWeightSelectedByUser: true,
        isPositive: true,
      },
      {
        shortName: 'A2',
        name: 'Solidarity and social justice in the supply chain',
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
      ratings,
    };
    const balanceSheetDTO = BalanceSheetDTOResponse.fromBalanceSheet(
      undefined,
      balanceSheet
    );
    expect(balanceSheetDTO).toBeDefined();
    expect(balanceSheetDTO.ratings).toMatchObject([
      {
        shortName: 'A1',
        name: 'Human dignity in the supply chain',
      },
      { shortName: 'A1.1' },
      {
        shortName: 'A2',
      },
    ]);
  });
});
