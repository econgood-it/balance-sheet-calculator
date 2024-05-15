import { Application } from 'express';
import { IUserService } from '../services/user.service';
import { allowUserOnly } from './role.access';

const resourceUrl = '/v1/user';
export const UserPaths = {
  getInvitation: `${resourceUrl}/me/invitation`,
  joinOrganization: `${resourceUrl}/me/invitation/:id`,
};

export function registerUserRoutes(
  app: Application,
  userService: IUserService
) {
  app.get(UserPaths.getInvitation, allowUserOnly, userService.getInvitations);
  app.patch(
    UserPaths.joinOrganization,
    allowUserOnly,
    userService.joinOrganization
  );
}
