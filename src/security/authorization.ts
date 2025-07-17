import { Request } from 'express';
import { NoAccessError } from '../exceptions/no.access.error';
import { Organization } from '../models/organization';
import { BalanceSheet } from '../models/balance.sheet';
import { IOrganizationRepo } from '../repositories/organization.repo';
import { Role } from '../models/user';

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
      ( organization.hasMember(request.authenticatedUser)
      || request.authenticatedUser.role === Role.Peer
      || request.authenticatedUser.role === Role.Auditor ) 
    )
  ) {
    throw new NoAccessError();
  }
}
