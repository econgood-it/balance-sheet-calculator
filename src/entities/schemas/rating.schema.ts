import { z } from 'zod';

export const RatingDBSchema = z.object({
  shortName: z.string(),
  type: z.union([z.literal('aspect'), z.literal('topic')]),
  estimations: z.number(),
  points: z.number(),
  maxPoints: z.number(),
  weight: z.number(),
  isWeightSelectedByUser: z.boolean(),
  isPositive: z.boolean(),
});
