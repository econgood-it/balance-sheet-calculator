import { WEIGHT_VALUES } from './validation.constants';
import { z } from 'zod';
import { isTopic, isTopicShortName } from '../models/rating';

export const RatingRequestBodySchema = z.object({
  shortName: z.string(),
  weight: z
    .number()
    .refine((v) => WEIGHT_VALUES.some((w) => w === v), {
      message: `Weight has to be one of the following values ${WEIGHT_VALUES}`,
    })
    .optional(),
  estimations: z.number().min(-200).max(10).optional(),
});

export type RatingRequestBody = z.infer<typeof RatingRequestBodySchema>;

export const RatingResponseBodySchema = z.object({
  shortName: z.string(),
  name: z.string(),
  weight: z.number(),
  estimations: z.number().nullable(),
  points: z.number(),
  maxPoints: z.number(),
  isPositive: z.boolean(),
  type: z.string(),
});

export type RatingResponseBody = z.infer<typeof RatingResponseBodySchema>;
