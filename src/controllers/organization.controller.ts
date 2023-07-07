import { Application } from 'express';
import { OrganizationService } from '../services/organization.service';
import { allowUserOnly } from './role.access';

const resourceUrl = '/v1/organization';
export const OrganizationPaths = {
  post: `${resourceUrl}`,
  put: `${resourceUrl}/:id`,
  getAll: `${resourceUrl}`,
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
  }
}
