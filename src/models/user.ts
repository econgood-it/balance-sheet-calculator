import { z } from 'zod';

export enum Role {
  User = 'User',
  Auditor = 'Auditor',
  Peer = 'Peer',
}

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.nativeEnum(Role),
});

export type User = z.infer<typeof UserSchema>;
