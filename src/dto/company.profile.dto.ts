import { z } from 'zod';

export const CompanyProfileSchema = z.object({
  name: z.string(),
  address: z.string(),
  country: z.string(),
  industrySector: z.string(),
  website: z.string().url(),
});
