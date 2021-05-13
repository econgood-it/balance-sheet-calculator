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
      '/v1/users',
      allowAdminOnly,
      this.userService.createUser.bind(this.userService)
    );
  }
}
