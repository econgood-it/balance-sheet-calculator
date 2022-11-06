import { z } from 'zod';

export const IndustryResponseBodySchema = z
  .object({
    industryCode: z.string(),
    name: z.string(),
  })
  .transform((i) => ({ industryCode: i.industryCode, industryName: i.name }));
