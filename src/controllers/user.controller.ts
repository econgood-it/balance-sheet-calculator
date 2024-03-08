import { Application } from 'express';
import { UserService } from '../services/user.service';
import { allowUserOnly } from './role.access';

const resourceUrl = '/v1/user';
export const UserPaths = {
  getInvitation: `${resourceUrl}/me/invitation`,
};

export class UserController {
  constructor(private app: Application, private userService: UserService) {
    this.routes();
  }

  private routes() {
    this.app.get(
      UserPaths.getInvitation,
      allowUserOnly,
      this.userService.getInvitations.bind(this.userService)
    );
  }
}
