import { z } from 'zod';
import { IndustryResponseBodySchema } from 'e-calculator-schemas/dist/industry.dto';

export const IndustrySchema = z.object({
  ecologicalSupplyChainRisk: z.number(),
  ecologicalDesignOfProductsAndServices: z.number(),
  industryCode: z.string(),
  name: z.string(),
});

export type Industry = z.infer<typeof IndustrySchema>;

export function industryToResponse(industry: Industry) {
  return IndustryResponseBodySchema.parse({
    ...industry,
    industryName: industry.name,
  });
}
