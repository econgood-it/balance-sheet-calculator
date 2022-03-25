import { Rating } from '../../../src/entities/rating';
import { BalanceSheetDTOResponse } from '../../../src/dto/response/balance.sheet.response.dto';
import { BalanceSheet } from '../../../src/entities/balanceSheet';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '../../../src/entities/enums';
import { EmptyCompanyFacts } from '../../testData/company.facts';

jest.mock('../../../src/i18n', () => ({
  init: () => {},
  use: () => {},
  t: (k: string) => 'Menschenwürde in der Zulieferkette',
}));

describe('BalanceSheetResponseDTO', () => {
  it('is created from balance sheet', async () => {
    const ratings = [
      new Rating(undefined, 'A1', 'v5:compact.A1', 2, 3, 51, 5, true, true),
      new Rating(undefined, 'A1.1', 'v5:compact.A1', 2, 3, 51, 5, true, true),
      new Rating(undefined, 'A2', 'v5:compact.A1', 2, 3, 51, 5, true, true),
    ];
    const balanceSheet = new BalanceSheet(
      undefined,
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_6,
      EmptyCompanyFacts,
      ratings,
      []
    );
    const balanceSheetDTO = BalanceSheetDTOResponse.fromBalanceSheet(
      balanceSheet,
      'de'
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
