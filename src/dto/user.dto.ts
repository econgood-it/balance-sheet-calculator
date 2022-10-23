import { z } from 'zod';
import { User } from '../entities/user';
import { Role } from '../entities/enums';

const isPassword = z.string().min(20);

export const UserRequestBodySchema = z
  .object({
    email: z.string().email(),
    password: isPassword,
  })
  .transform((u) => new User(undefined, u.email, u.password, Role.User));

export const PasswordResetRequestBodySchema = z
  .object({
    newPassword: isPassword,
  })
  .transform((pr) => ({
    password: pr.newPassword,
  }));
