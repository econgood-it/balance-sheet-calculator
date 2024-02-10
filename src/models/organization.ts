import { z } from 'zod';

const errorMsg = 'Must not be blank';
const isNonEmptyString = z
  .string({ required_error: errorMsg })
  .min(1, { message: errorMsg });

export const OrganizationSchema = z.object({
  name: isNonEmptyString,
  address: z.object({
    city: isNonEmptyString,
    houseNumber: isNonEmptyString,
    street: isNonEmptyString,
    zip: isNonEmptyString,
  }),
  invitations: z.string().email().array(),
});

export type Organization = z.infer<typeof OrganizationSchema>;
