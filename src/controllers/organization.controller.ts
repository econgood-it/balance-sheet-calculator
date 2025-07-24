import { Application } from 'express';
import { IOrganizationService } from '../services/organization.service';
import { allowAnyone } from '../security/role.access';

const resourceUrl = '/v1/organization';
export const OrganizationPaths = {
  post: `${resourceUrl}`,
  put: `${resourceUrl}/:id`,
  getAll: `${resourceUrl}`,
  get: `${resourceUrl}/:id`,
  orgaInvitation: `${resourceUrl}/:id/invitation/:email`,
  orgaBalanceSheet: `${resourceUrl}/:id/balancesheet`,
  orgaBalanceSheetUpload: `${resourceUrl}/:id/balancesheet/upload`,
};

export function registerOrganizationRoutes(
  app: Application,
  organizationService: IOrganizationService
) {
  app.post(
    OrganizationPaths.post,
    allowAnyone,
    organizationService.createOrganization
  );
  app.post(
    OrganizationPaths.orgaInvitation,
    allowAnyone,
    organizationService.inviteUser
  );
  app.get(
    OrganizationPaths.getAll,
    allowAnyone,
    organizationService.getOrganizationsOfCurrentUser
  );
  app.get(
    OrganizationPaths.get,
    allowAnyone,
    organizationService.getOrganization
  );
  app.put(
    OrganizationPaths.put,
    allowAnyone,
    organizationService.updateOrganization
  );
  app.post(
    OrganizationPaths.orgaBalanceSheet,
    allowAnyone,
    organizationService.createBalanceSheet
  );
  app.get(
    OrganizationPaths.orgaBalanceSheet,
    allowAnyone,
    organizationService.getBalanceSheets
  );
}
