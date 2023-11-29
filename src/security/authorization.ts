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
      !request.authenticatedUser ||
      !(
        request.authenticatedUser &&
        balanceSheetEntity.organizationEntity?.hasMember({
          id: request.authenticatedUser.email,
        })
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
        request.authenticatedUser &&
        organizationEntity.hasMember({ id: request.authenticatedUser.email })
      )
    ) {
      throw new NoAccessError();
    }
  }
}
