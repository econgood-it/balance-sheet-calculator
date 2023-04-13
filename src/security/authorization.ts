import { Request } from 'express';
import { BalanceSheetEntity } from '../entities/balance.sheet.entity';
import { NoAccessError } from '../exceptions/no.access.error';
import { IUserEntityRepo } from '../repositories/user.entity.repo';

export namespace Authorization {
  export async function checkBalanceSheetPermissionForCurrentUser(
    request: Request,
    balanceSheet: BalanceSheetEntity,
    userRepo: IUserEntityRepo
  ): Promise<void> {
    if (request.userInfo) {
      const foundUser = await userRepo.findOneByEmail(request.userInfo.email);
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
