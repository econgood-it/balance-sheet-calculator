import { translateBalanceSheet } from '../../src/language/translations';
import { balanceSheetFactory } from '../../src/openapi/examples';

jest.mock('../../src/i18n', () => ({
  init: () => {},
  use: () => {},
  t: (k: string) =>
    k === 'Working conditions and social impact in the supply chain'
      ? 'Arbeitsbedingungen und gesellschaftliche Auswirkungen in der Zulieferkette'
      : k,
}));

describe('Translations', () => {
  it('should translate balance sheet', async function () {
    const balanceSheet = balanceSheetFactory.emptyV508();
    const translatedBalanceSheet = translateBalanceSheet(balanceSheet, 'de');
    expect(
      translatedBalanceSheet.ratings.filter((r) => r.shortName === 'A1.1')[0]
        .name
    ).toBe(
      'Arbeitsbedingungen und gesellschaftliche Auswirkungen in der Zulieferkette'
    );
  });
});
