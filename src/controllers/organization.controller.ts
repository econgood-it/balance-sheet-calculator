import { Application } from 'express';
import { IOrganizationService } from '../services/organization.service';
import { allowUserOnly } from './role.access';

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
    allowUserOnly,
    organizationService.createOrganization
  );
  app.post(
    OrganizationPaths.orgaInvitation,
    allowUserOnly,
    organizationService.inviteUser
  );
  app.get(
    OrganizationPaths.getAll,
    allowUserOnly,
    organizationService.getOrganizationsOfCurrentUser
  );
  app.get(
    OrganizationPaths.get,
    allowUserOnly,
    organizationService.getOrganization
  );
  app.put(
    OrganizationPaths.put,
    allowUserOnly,
    organizationService.updateOrganization
  );
  app.post(
    OrganizationPaths.orgaBalanceSheet,
    allowUserOnly,
    organizationService.createBalanceSheet
  );
  app.get(
    OrganizationPaths.orgaBalanceSheet,
    allowUserOnly,
    organizationService.getBalanceSheets
  );
}
