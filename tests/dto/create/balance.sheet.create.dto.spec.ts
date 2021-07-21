import { BalanceSheetDTOCreate } from '../../../src/dto/create/balance.sheet.create.dto';
import {
  BalanceSheetType,
  BalanceSheetVersion,
  Role,
} from '../../../src/entities/enums';
import { RatingFactory } from '../../../src/factories/rating.factory';
import { modifyAspect, modifyTopic } from '../../rating.modification.utils';
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

    const expectedRating = await RatingFactory.createDefaultRating(
      json.type,
      json.version
    );

    modifyAspect(expectedRating, 'A1.1', 5, 1, true);
    modifyAspect(expectedRating, 'D1.2', 3, 0.5, true);
    modifyAspect(expectedRating, 'E2.1', 3, undefined, false);
    modifyTopic(expectedRating, 'D1', undefined, 1.5, true);

    expect(result.rating).toMatchObject(toJsObject(expectedRating));
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

    const expectedRating = await RatingFactory.createDefaultRating(
      json.type,
      json.version
    );
    expect(result.rating).toMatchObject(toJsObject(expectedRating));
  });
});
