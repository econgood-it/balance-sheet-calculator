import {
  BalanceSheetCreateRequestBodySchema,
  balanceSheetToResponse,
} from '../../src/dto/balance.sheet.dto';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '../../src/models/balance.sheet';
import { RatingsFactory } from '../../src/factories/ratings.factory';
import { balanceSheetFactory } from '../testData/balance.sheet';

describe('BalanceSheetCreateRequestBodySchema', () => {
  it('parse json with a merged rating entity', () => {
    const json = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_4,
      ratings: [
        { shortName: 'A1.1', estimations: 5, weight: 1 },
        { shortName: 'D1', weight: 1.5 },
        { shortName: 'D1.2', estimations: 3, weight: 0.5 },
        { shortName: 'E2.1', estimations: 3 },
      ],
    };
    const result = BalanceSheetCreateRequestBodySchema.parse(json);

    const defaultRatings = RatingsFactory.createDefaultRatings(
      json.type,
      json.version
    );
    const expectedRatings = defaultRatings.map((r) => {
      if (r.shortName === 'A1.1') {
        return {
          shortName: 'A1.1',
          estimations: 5,
          weight: 1,
          isWeightSelectedByUser: true,
        };
      } else if (r.shortName === 'D1.2') {
        return {
          shortName: 'D1.2',
          estimations: 3,
          weight: 0.5,
          isWeightSelectedByUser: true,
        };
      } else if (r.shortName === 'E2.1') {
        return {
          ...r,
          shortName: 'E2.1',
          estimations: 3,
          isWeightSelectedByUser: false,
        };
      } else if (r.shortName === 'D1') {
        return {
          ...r,
          shortName: 'D1',
          weight: 1.5,
          isWeightSelectedByUser: true,
        };
      } else {
        return r;
      }
    });

    expect(result.ratings).toMatchObject(expectedRatings);
  });

  it('parse json with default rating entity', async () => {
    const json = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_4,
    };
    const result = await BalanceSheetCreateRequestBodySchema.parseAsync(json);

    const expectedRatings = RatingsFactory.createDefaultRatings(
      json.type,
      json.version
    );
    expect(result.ratings).toMatchObject(expectedRatings);
  });
});

describe('balanceSheetToResponse', () => {
  it('parse balanceSheet where country code of main origin of suppliers is not provided', () => {
    const balanceSheet = {
      ...balanceSheetFactory.emptyV508(),
      companyFacts: {
        ...balanceSheetFactory.emptyV508().companyFacts,
        mainOriginOfOtherSuppliers: { costs: 9 },
      },
    };
    const balanceSheetResponse = balanceSheetToResponse(
      undefined,
      balanceSheet,
      'en'
    );
    expect(
      balanceSheetResponse.companyFacts.mainOriginOfOtherSuppliers.countryCode
    ).toBeUndefined();
  });

  it('parse balanceSheet where hasCanteen is undefined', () => {
    const balanceSheet = {
      ...balanceSheetFactory.emptyV508(),
      companyFacts: {
        ...balanceSheetFactory.emptyV508().companyFacts,
        hasCanteen: undefined,
      },
    };
    const balanceSheetResponse = balanceSheetToResponse(
      undefined,
      balanceSheet,
      'en'
    );
    expect(balanceSheetResponse.companyFacts.hasCanteen).toBeUndefined();
  });

  it('parse balanceSheet where country code of some suppliers is missing', () => {
    const balanceSheet = {
      ...balanceSheetFactory.emptyV508(),
      companyFacts: {
        ...balanceSheetFactory.emptyV508().companyFacts,
        supplyFractions: [
          { countryCode: 'ARE', industryCode: 'A', costs: 9 },
          { industryCode: 'Be', costs: 7 },
        ],
        mainOriginOfOtherSuppliers: { costs: 9, countryCode: 'DEU' },
      },
    };
    const balanceSheetResponse = balanceSheetToResponse(
      undefined,
      balanceSheet,
      'en'
    );
    expect(
      balanceSheetResponse.companyFacts.supplyFractions.some(
        (s) => s.countryCode === undefined
      )
    ).toBeTruthy();
  });
});
