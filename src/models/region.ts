import { z } from 'zod';

export const RegionSchema = z.object({
  pppIndex: z.number(),
  countryCode: z.string(),
  countryName: z.string(),
  ituc: z.number(),
});

export type Region = z.infer<typeof RegionSchema>;
export const DEFAULT_COUNTRY_CODE = 'AWO';
