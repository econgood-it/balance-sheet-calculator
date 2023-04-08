import { z } from 'zod';
import {
  OrganizationRequestSchema,
  OrganizationResponseSchema,
} from '@ecogood/e-calculator-schemas/dist/organization.dto';
import { OrganizationEntity } from '../entities/organization.entity';

export type Organization = z.infer<typeof OrganizationRequestSchema>;

export namespace OrganizationParser {
  export function fromJson(
    json: z.input<typeof OrganizationRequestSchema>
  ): Organization {
    return OrganizationRequestSchema.parse(json);
  }
  export function toJson(organizationEntity: OrganizationEntity) {
    return OrganizationResponseSchema.parse({
      id: organizationEntity.id,
      ...organizationEntity.organization,
    });
  }
}
