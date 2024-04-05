import { Application } from 'express';
import {
  IOrganizationService,
  OldOrganizationService,
} from '../services/organization.service';
import { allowUserOnly } from './role.access';
import { upload } from './utils';
import deepFreeze from 'deep-freeze';

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
    this.app.get(
      OrganizationPaths.getAll,
      allowUserOnly,
      this.oldOrganizationService.getOrganizationsOfCurrentUser.bind(
        this.oldOrganizationService
      )
    );
    this.app.get(
      OrganizationPaths.get,
      allowUserOnly,
      this.oldOrganizationService.getOrganization.bind(
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
    this.app.post(
      OrganizationPaths.orgaInvitation,
      allowUserOnly,
      this.oldOrganizationService.inviteUser.bind(this.oldOrganizationService)
    );
  }
}
