import axios from 'axios';
import deepFreeze from 'deep-freeze';
import { z } from 'zod';

type ZitadelClient = {
  getUser(userId: string): Promise<{ email: string; fullName: string }>;
};

export function makeZitadelClient(token: string): ZitadelClient {
  async function getUser(
    userId: string
  ): Promise<{ email: string; fullName: string }> {
    const response = await axios.get(
      `https://zitadel.dev.econgood.org/management/v1/users/${userId}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const UserSchema = z
      .object({
        user: z.object({
          human: z.object({
            email: z.object({
              email: z.string(),
            }),
            profile: z.object({
              firstName: z.string(),
              lastName: z.string(),
            }),
          }),
        }),
      })
      .transform(({ user }) => ({
        email: user.human.email.email,
        fullName: `${user.human.profile.firstName} ${user.human.profile.lastName}`,
      }));
    return UserSchema.parse(response.data);
  }
  return deepFreeze({ getUser });
}
