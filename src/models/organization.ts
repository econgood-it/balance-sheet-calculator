import { z } from 'zod';
import { OrganizationRequestSchema } from '@ecogood/e-calculator-schemas/dist/organization.dto';

export type Organization = z.infer<typeof OrganizationRequestSchema>;
