import { Request } from 'express';
import { BalanceSheetEntity } from '../entities/balance.sheet.entity';
import { NoAccessError } from '../exceptions/no.access.error';
import { OrganizationEntity } from '../entities/organization.entity';

export namespace Authorization {
  export async function checkIfCurrentUserHasEditorPermissions(
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

  export async function checkIfCurrentUserIsMember(
    request: Request,
    organizationEntity: OrganizationEntity
  ): Promise<void> {
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
