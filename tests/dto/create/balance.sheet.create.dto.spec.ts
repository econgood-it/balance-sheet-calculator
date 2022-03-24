import { BalanceSheetDTOCreate } from '../../../src/dto/create/balance.sheet.create.dto';
import {
  BalanceSheetType,
  BalanceSheetVersion,
  Role,
} from '../../../src/entities/enums';
import { RatingsFactory } from '../../../src/factories/ratings.factory';
import { modifyRating } from '../../rating.modification.utils';
import { toJsObject } from '../../to.js.object';
import { User } from '../../../src/entities/user';

describe('BalanceSheetCreateDTO', () => {
  const users = [
    new User(undefined, 'test@example.com', 'test1234', Role.User),
  ];
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
    const result = await balanceSheetDTOCreate.toBalanceSheet('en', users);

    const expectedRatings = await RatingsFactory.createDefaultRatings(
      json.type,
      json.version
    );

    modifyRating(expectedRatings, 'A1.1', 5, 1, true);
    modifyRating(expectedRatings, 'D1.2', 3, 0.5, true);
    modifyRating(expectedRatings, 'E2.1', 3, undefined, false);
    modifyRating(expectedRatings, 'D1', undefined, 1.5, true);

    expect(result.ratings).toMatchObject(toJsObject(expectedRatings));
  });

  it('is created from json with default rating entity', async () => {
    const json = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_4,
    };
    const balanceSheetDTOCreate = BalanceSheetDTOCreate.fromJSON(
      toJsObject(json)
    );
    const result = await balanceSheetDTOCreate.toBalanceSheet('en', users);

    const expectedRatings = await RatingsFactory.createDefaultRatings(
      json.type,
      json.version
    );
    expect(result.ratings).toMatchObject(toJsObject(expectedRatings));
  });
});
