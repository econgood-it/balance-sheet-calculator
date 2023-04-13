import { Request } from 'express';
import { BalanceSheetEntity } from '../entities/balance.sheet.entity';
import { NoAccessError } from '../exceptions/no.access.error';
import { IUserEntityRepo } from '../repositories/user.entity.repo';

export namespace Authorization {
  export async function checkBalanceSheetPermissionForCurrentUser(
    request: Request,
    balanceSheetEntity: BalanceSheetEntity
  ): Promise<void> {
    if (
      !(
        request.userInfo &&
        balanceSheetEntity.userWithEmailHasAccess(request.userInfo.email)
      )
    ) {
      throw new NoAccessError();
    }
  }
}
