import { z } from 'zod';
import {
  OrganizationRequestSchema,
  OrganizationResponseSchema,
} from '@ecogood/e-calculator-schemas/dist/organization.dto';
import { OrganizationEntity } from '../entities/organization.entity';

export type Organization = z.infer<typeof OrganizationRequestSchema>;

export function organizationEntityToResponse(
  organizationEntity: OrganizationEntity
) {
  return OrganizationResponseSchema.parse({
    id: organizationEntity.id,
    ...organizationEntity.organization,
  });
}
