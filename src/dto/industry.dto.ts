import { z } from 'zod';
import { Industry } from '../models/industry';

export function industryToResponse(industry: Industry) {
  return IndustryResponseBodySchema.parse({
    ...industry,
    industryName: industry.name,
  });
}

export const IndustryResponseBodySchema = z.object({
  industryCode: z.string(),
  industryName: z.string(),
});
