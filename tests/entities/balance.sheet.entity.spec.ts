import { BalanceSheetEntity } from '../../src/entities/balance.sheet.entity';
import { balanceSheetFactory } from '../../src/openapi/examples';
import { User } from '../../src/entities/user';
import { Role } from '../../src/entities/enums';

describe('BalanceSheetEntity', () => {
  it('should check user access to balance sheet', function () {
    const userEmail = 'test@example.com';
    const balanceSheetEntity = new BalanceSheetEntity(
      undefined,
      balanceSheetFactory.emptyV508(),
      [
        new User(undefined, userEmail, 'pass', Role.User),
        new User(undefined, 'other@example.com', 'pass', Role.User),
      ]
    );
    expect(balanceSheetEntity.userWithEmailHasAccess(userEmail)).toBeTruthy();
    expect(
      balanceSheetEntity.userWithEmailHasAccess('invalid@example.com')
    ).toBeFalsy();
  });
});

describe('toJson', () => {
  it('returns balanceSheet where country code of some suppliers is missing', () => {
    const balanceSheetEntity = new BalanceSheetEntity(
      undefined,
      {
        ...balanceSheetFactory.emptyV508(),
        companyFacts: {
          ...balanceSheetFactory.emptyV508().companyFacts,
          supplyFractions: [
            { countryCode: 'ARE', industryCode: 'A', costs: 9 },
            { industryCode: 'Be', costs: 7 },
          ],
          mainOriginOfOtherSuppliers: { costs: 9, countryCode: 'DEU' },
        },
      },
      []
    );
    const balanceSheetResponse = balanceSheetEntity.toJson('en');
    expect(
      balanceSheetResponse.companyFacts.supplyFractions.some(
        (s) => s.countryCode === undefined
      )
    ).toBeTruthy();
  });
  it('returns balanceSheet and transforms decimals back to percentages', () => {
    const balanceSheetEntity = new BalanceSheetEntity(
      undefined,
      {
        ...balanceSheetFactory.emptyV508(),
        companyFacts: {
          ...balanceSheetFactory.emptyV508().companyFacts,
          employeesFractions: [
            { countryCode: 'ARE', percentage: 0.3 },
            { percentage: 0.5 },
          ],
          industrySectors: [
            { industryCode: 'A', amountOfTotalTurnover: 0.7, description: '' },
          ],
        },
      },
      []
    );
    const balanceSheetResponse = balanceSheetEntity.toJson('en');
    for (const index in balanceSheetResponse.companyFacts.industrySectors) {
      expect(
        balanceSheetResponse.companyFacts.industrySectors[index]
          .amountOfTotalTurnover
      ).toBe(
        balanceSheetEntity.companyFacts.industrySectors[index]
          .amountOfTotalTurnover * 100
      );
    }
    for (const index in balanceSheetResponse.companyFacts.employeesFractions) {
      expect(
        balanceSheetResponse.companyFacts.employeesFractions[index].percentage
      ).toBe(
        balanceSheetEntity.companyFacts.employeesFractions[index].percentage *
          100
      );
    }
  });

  it('returns balanceSheet where country code of some employees is missing', () => {
    const balanceSheetEntity = new BalanceSheetEntity(
      undefined,
      {
        ...balanceSheetFactory.emptyV508(),
        companyFacts: {
          ...balanceSheetFactory.emptyV508().companyFacts,
          employeesFractions: [
            { countryCode: 'ARE', percentage: 0.3 },
            { percentage: 0.5 },
          ],
          mainOriginOfOtherSuppliers: { costs: 9, countryCode: 'DEU' },
        },
      },
      []
    );
    const balanceSheetResponse = balanceSheetEntity.toJson('en');

    expect(
      balanceSheetResponse.companyFacts.employeesFractions.some(
        (s) => s.countryCode === undefined
      )
    ).toBeTruthy();
  });

  it('returns balanceSheet where hasCanteen is undefined', () => {
    const balanceSheetEntity = new BalanceSheetEntity(
      undefined,
      {
        ...balanceSheetFactory.emptyV508(),
        companyFacts: {
          ...balanceSheetFactory.emptyV508().companyFacts,
          hasCanteen: undefined,
        },
      },
      []
    );
    const balanceSheetResponse = balanceSheetEntity.toJson('en');
    expect(balanceSheetResponse.companyFacts.hasCanteen).toBeUndefined();
  });

  it('returns balanceSheet where country code of main origin of suppliers is not provided', () => {
    const balanceSheetEntity = new BalanceSheetEntity(
      undefined,
      {
        ...balanceSheetFactory.emptyV508(),
        companyFacts: {
          ...balanceSheetFactory.emptyV508().companyFacts,
          mainOriginOfOtherSuppliers: { costs: 9 },
        },
      },
      []
    );
    const balanceSheetResponse = balanceSheetEntity.toJson('en');
    expect(
      balanceSheetResponse.companyFacts.mainOriginOfOtherSuppliers.countryCode
    ).toBeUndefined();
  });
});
