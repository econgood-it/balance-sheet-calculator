import { z } from 'zod';

export enum Role {
  Admin = 'Admin',
  User = 'User',
}

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.nativeEnum(Role),
});

export type User = z.infer<typeof UserSchema>;
