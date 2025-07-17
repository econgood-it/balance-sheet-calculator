import { Application } from 'express';
import { IUserService } from '../services/user.service';
import { allowAnyone } from '../security/role.access';

const resourceUrl = '/v1/user';
export const UserPaths = {
  getInvitation: `${resourceUrl}/me/invitation`,
  joinOrganization: `${resourceUrl}/me/invitation/:id`,
};

export function registerUserRoutes(
  app: Application,
  userService: IUserService
) {
  app.get(UserPaths.getInvitation, allowAnyone, userService.getInvitations);
  app.patch(
    UserPaths.joinOrganization,
    allowAnyone,
    userService.joinOrganization
  );
}
