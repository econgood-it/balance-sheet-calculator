import { z } from 'zod';

export const IndustrySchema = z.object({
  ecologicalSupplyChainRisk: z.number(),
  ecologicalDesignOfProductsAndServices: z.number(),
  industryCode: z.string(),
  name: z.string(),
});

export type Industry = z.infer<typeof IndustrySchema>;
