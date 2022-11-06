import { z } from 'zod';

export const RegionResponseBodySchema = z.object({
  countryCode: z.string(),
  countryName: z.string(),
});
