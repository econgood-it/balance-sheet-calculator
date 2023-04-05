import { Application } from 'express';
import { OrganizationService } from '../services/organization.service';
import { allowAdminOnly, allowUserOnly } from './role.access';

const resourceUrl = '/v1/organization';
export const OrganizationPaths = {
  post: `${resourceUrl}`,
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
  }
}
