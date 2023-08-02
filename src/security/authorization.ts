import { Request } from 'express';
import { BalanceSheetEntity } from '../entities/balance.sheet.entity';
import { NoAccessError } from '../exceptions/no.access.error';
import { OrganizationEntity } from '../entities/organization.entity';

export namespace Authorization {
  export function checkIfCurrentUserHasEditorPermissions(
    request: Request,
    balanceSheetEntity: BalanceSheetEntity
  ) {
    if (
      !(
        request.userInfo &&
        (balanceSheetEntity.userWithEmailHasAccess(request.userInfo.email) ||
          balanceSheetEntity.organizationEntity?.hasMemberWithEmail(
            request.userInfo.email
          ))
      )
    ) {
      throw new NoAccessError();
    }
  }

  export function checkIfCurrentUserIsMember(
    request: Request,
    organizationEntity: OrganizationEntity
  ) {
    if (
      !(
        request.userInfo &&
        organizationEntity.hasMemberWithEmail(request.userInfo.email)
      )
    ) {
      throw new NoAccessError();
    }
  }
}
