import { BalanceSheetDTOCreate } from '../../../src/dto/create/balance.sheet.create.dto';
import { RatingsFactory } from '../../../src/factories/ratings.factory';
import { toJsObject } from '../../to.js.object';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '../../../src/models/balance.sheet';

describe('BalanceSheetCreateDTO', () => {
  it('is created from json with a merged rating entity', async () => {
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
    const balanceSheetDTOCreate = BalanceSheetDTOCreate.fromJSON(
      toJsObject(json)
    );
    const result = await balanceSheetDTOCreate.toBalanceSheet();

    const defaultRatings = await RatingsFactory.createDefaultRatings(
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

  it('is created from json with default rating entity', async () => {
    const json = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_4,
    };
    const balanceSheetDTOCreate = BalanceSheetDTOCreate.fromJSON(
      toJsObject(json)
    );
    const result = await balanceSheetDTOCreate.toBalanceSheet();

    const expectedRatings = await RatingsFactory.createDefaultRatings(
      json.type,
      json.version
    );
    expect(result.ratings).toMatchObject(toJsObject(expectedRatings));
  });
});
