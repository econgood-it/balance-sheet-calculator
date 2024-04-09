import { Application } from 'express';
import {
  IOrganizationService,
  OldOrganizationService,
} from '../services/organization.service';
import { allowUserOnly } from './role.access';
import { upload } from './utils';

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
}

export class OrganizationController {
  constructor(
    private app: Application,
    public oldOrganizationService: OldOrganizationService
  ) {
    this.routes();
  }

  public routes() {
    this.app.put(
      OrganizationPaths.put,
      allowUserOnly,
      this.oldOrganizationService.updateOrganization.bind(
        this.oldOrganizationService
      )
    );

    this.app.post(
      OrganizationPaths.orgaBalanceSheet,
      allowUserOnly,
      this.oldOrganizationService.createBalanceSheet.bind(
        this.oldOrganizationService
      )
    );

    this.app.post(
      OrganizationPaths.orgaBalanceSheetUpload,
      allowUserOnly,
      upload.single('balanceSheet'),
      this.oldOrganizationService.uploadBalanceSheet.bind(
        this.oldOrganizationService
      )
    );

    this.app.get(
      OrganizationPaths.orgaBalanceSheet,
      allowUserOnly,
      this.oldOrganizationService.getBalanceSheets.bind(
        this.oldOrganizationService
      )
    );
  }
}
