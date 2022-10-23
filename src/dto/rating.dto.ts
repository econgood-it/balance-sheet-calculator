import { WEIGHT_VALUES } from './validation.constants';
import { z } from 'zod';

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
