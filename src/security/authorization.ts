import { Request } from 'express';
import { BalanceSheetEntity } from '../entities/balance.sheet.entity';
import { EntityManager } from 'typeorm';
import { User } from '../entities/user';
import { NoAccessError } from '../exceptions/no.access.error';

export namespace Authorization {
  export async function checkBalanceSheetPermissionForCurrentUser(
    request: Request,
    balanceSheet: BalanceSheetEntity,
    entityManager: EntityManager
  ): Promise<void> {
    if (request.userInfo) {
      const foundUser = await entityManager
        .getRepository(User)
        .findOne({ where: { email: request.userInfo.email } });
      if (foundUser) {
        const userWithAccess = balanceSheet.users.find(
          (u) => u.id === foundUser.id
        );
        if (userWithAccess) {
          return;
        }
      }
    }
    throw new NoAccessError();
  }
}
