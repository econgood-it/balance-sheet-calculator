import { BalanceSheetEntity } from '../../src/entities/balance.sheet.entity';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { balanceSheetFactory } from '../../src/openapi/examples';
import { User } from '../../src/entities/user';
import { Role } from '../../src/entities/enums';

describe('BalanceSheetEntity', () => {
  it('should check user access to balance sheet', function () {
    const userEmail = 'test@example.com';
    const balanceSheetEntity = new BalanceSheetEntity(
      undefined,
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_8,
      balanceSheetFactory.emptyV508().ratings,
      balanceSheetFactory.emptyV508().companyFacts,
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
