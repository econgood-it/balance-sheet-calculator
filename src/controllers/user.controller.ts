import { Application } from 'express';
import { UserService } from '../services/user.service';
import { allowAdminOnly } from './role.access';

export class UserController {
  constructor(private app: Application, public userService: UserService) {
    this.routes();
  }

  public routes() {
    this.app.post(
      '/v1/users/token',
      this.userService.getToken.bind(this.userService)
    );
    this.app.post(
      '/v1/users/actions/reset/password',
      this.userService.resetPassword.bind(this.userService)
    );
    this.app.post(
      '/v1/users/:id/apikeys',
      this.userService.createApiKey.bind(this.userService)
    );
    this.app.post(
      '/v1/users',
      allowAdminOnly,
      this.userService.createUser.bind(this.userService)
    );
    this.app.delete(
      '/v1/users',
      allowAdminOnly,
      this.userService.deleteUser.bind(this.userService)
    );
  }
}
