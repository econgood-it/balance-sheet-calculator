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
