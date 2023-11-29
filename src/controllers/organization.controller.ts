import { Application } from 'express';
import { OrganizationService } from '../services/organization.service';
import { allowUserOnly } from './role.access';
import { upload } from './utils';

const resourceUrl = '/v1/organization';
export const OrganizationPaths = {
  post: `${resourceUrl}`,
  put: `${resourceUrl}/:id`,
  getAll: `${resourceUrl}`,
  get: `${resourceUrl}/:id`,
  orgaBalanceSheet: `${resourceUrl}/:id/balancesheet`,
  orgaBalanceSheetUpload: `${resourceUrl}/:id/balancesheet/upload`,
};

export class OrganizationController {
  constructor(
    private app: Application,
    public organizationService: OrganizationService
  ) {
    this.routes();
  }

  public routes() {
    this.app.post(
      OrganizationPaths.post,
      allowUserOnly,
      this.organizationService.createOrganization.bind(this.organizationService)
    );
    this.app.put(
      OrganizationPaths.put,
      allowUserOnly,
      this.organizationService.updateOrganization.bind(this.organizationService)
    );
    this.app.get(
      OrganizationPaths.getAll,
      allowUserOnly,
      this.organizationService.getOrganizationsOfCurrentUser.bind(
        this.organizationService
      )
    );
    this.app.get(
      OrganizationPaths.get,
      allowUserOnly,
      this.organizationService.getOrganization.bind(this.organizationService)
    );
    this.app.post(
      OrganizationPaths.orgaBalanceSheet,
      allowUserOnly,
      this.organizationService.createBalanceSheet.bind(this.organizationService)
    );

    this.app.post(
      OrganizationPaths.orgaBalanceSheetUpload,
      allowUserOnly,
      upload.single('balanceSheet'),
      this.organizationService.uploadBalanceSheet.bind(this.organizationService)
    );

    this.app.get(
      OrganizationPaths.orgaBalanceSheet,
      allowUserOnly,
      this.organizationService.getBalanceSheets.bind(this.organizationService)
    );
  }
}
