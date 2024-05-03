import { Request } from 'express';
import { BalanceSheetEntity } from '../entities/balance.sheet.entity';
import { OrganizationEntity } from '../entities/organization.entity';
import { NoAccessError } from '../exceptions/no.access.error';
import { Organization } from '../models/organization';
import { BalanceSheet } from '../models/balance.sheet';
import { IOrganizationRepo } from '../repositories/organization.repo';

export namespace Authorization {
  export function checkIfCurrentUserHasEditorPermissions(
    request: Request,
    balanceSheetEntity: BalanceSheetEntity
  ) {
    if (balanceSheetEntity.organizationEntity === undefined) {
      throw new NoAccessError();
    }
    Authorization.checkIfCurrentUserIsMember(
      request,
      balanceSheetEntity.organizationEntity
    );
  }

  export function checkIfCurrentUserIsMember(
    request: Request,
    organizationEntity: OrganizationEntity
  ) {
    if (
      !(
        request.authenticatedUser &&
        organizationEntity.hasMember({ id: request.authenticatedUser.id })
      )
    ) {
      throw new NoAccessError();
    }
  }
}

export async function checkIfCurrentUserHasEditorPermissions(
  request: Request,
  organizationRepository: IOrganizationRepo,
  balanceSheet: BalanceSheet
) {
  if (balanceSheet.organizationId === undefined) {
    throw new NoAccessError();
  }
  const organization = await organizationRepository.findByIdOrFail(
    balanceSheet.organizationId
  );
  checkIfCurrentUserIsMember(request, organization);
}

export function checkIfCurrentUserIsMember(
  request: Request,
  organization: Organization
) {
  if (
    !(
      request.authenticatedUser &&
      organization.hasMember(request.authenticatedUser)
    )
  ) {
    throw new NoAccessError();
  }
}
