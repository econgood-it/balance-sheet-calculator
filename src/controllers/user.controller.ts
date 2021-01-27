import { Application } from 'express';
import {UserService} from "../services/user.service";


export class UserController {

  constructor(private app: Application, public userService: UserService) {
    this.routes();
  }

  public routes() {
    this.app.post("/login", this.userService.login.bind(this.userService));
  }
}