import { z } from 'zod';
import { isWeight } from '@ecogood/e-calculator-schemas/dist/shared.schemas';

export const StakeholderWeightSchema = z.object({
  shortName: z.string(),
  weight: isWeight,
});

export type StakeholderWeight = z.infer<typeof StakeholderWeightSchema>;
