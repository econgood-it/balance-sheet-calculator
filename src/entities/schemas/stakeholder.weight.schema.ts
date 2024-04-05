import { z } from 'zod';
import { isWeight } from '@ecogood/e-calculator-schemas/dist/shared.schemas';

export const StakeholderWeightDBSchema = z.object({
  shortName: z.string(),
  weight: isWeight,
});
