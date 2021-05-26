import { Request } from 'express';
import { Role } from './entities/enums';
export interface IUserRequest extends Request {
  userInfo: {
    id: number;
    role: Role;
    email: string;
  };
}
