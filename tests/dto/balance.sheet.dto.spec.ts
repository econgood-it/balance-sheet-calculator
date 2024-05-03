import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { OldRatingsFactory } from '../../src/factories/oldRatingsFactory';
import { companyFactsJsonFactory } from '../../src/openapi/examples';
import { BalanceSheetCreateRequest } from '../../src/dto/balance.sheet.dto';

describe('Transform', () => {
  it('json with a merged rating to a balance sheet entity', () => {
    const json = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_8,
      ratings: [
        { shortName: 'A1.1', estimations: 5, weight: 1 },
        { shortName: 'D1', weight: 1.5 },
        { shortName: 'D1.2', estimations: 3, weight: 0.5 },
        { shortName: 'E2.1', estimations: 3 },
      ],
    };
    const result = new BalanceSheetCreateRequest(json).toBalanceEntity();

    const defaultRatings = OldRatingsFactory.createDefaultRatings(
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

  it('json with default rating to balance sheet entity', async () => {
    const json = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_8,
    };
    const result = new BalanceSheetCreateRequest(json).toBalanceEntity();

    const expectedRatings = OldRatingsFactory.createDefaultRatings(
      json.type,
      json.version
    );
    expect(result.ratings).toMatchObject(expectedRatings);
  });

  it('json and divide percentage values by 100', async () => {
    const companyFactsAsJson = companyFactsJsonFactory.nonEmptyRequest();
    const json = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_8,
      companyFacts: companyFactsAsJson,
    };
    const result = new BalanceSheetCreateRequest(json).toBalanceEntity();
    expect(result.companyFacts.industrySectors).toHaveLength(
      companyFactsAsJson.industrySectors.length
    );
    expect(result.companyFacts.employeesFractions).toHaveLength(
      companyFactsAsJson.employeesFractions.length
    );
    for (const index in result.companyFacts.industrySectors) {
      expect(
        result.companyFacts.industrySectors[index].amountOfTotalTurnover
      ).toBe(
        companyFactsAsJson.industrySectors[index].amountOfTotalTurnover / 100
      );
    }
    for (const index in result.companyFacts.employeesFractions) {
      expect(result.companyFacts.employeesFractions[index].percentage).toBe(
        companyFactsAsJson.employeesFractions[index].percentage / 100
      );
    }
  });
});
