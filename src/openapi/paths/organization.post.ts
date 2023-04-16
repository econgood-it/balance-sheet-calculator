import { organizationFactory } from '../examples';

import { applicationJson, HttpCodes, Methods, Tags } from './paths';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { OpenApiSchemas } from '../schemas';
import { OpenApiParams } from '../params';
import { OrganizationPaths } from '../../controllers/organization.controller';
import { OrganizationResponseSchema } from '@ecogood/e-calculator-schemas/dist/organization.dto';

export function registerOrganizationPost(
  registry: OpenAPIRegistry,
  schemas: OpenApiSchemas,
  params: OpenApiParams
) {
  registry.registerPath({
    method: Methods.post,
    path: OrganizationPaths.post,
    tags: [Tags.organization],
    description: 'Create a new organization',
    summary: 'Post organization',

    request: {
      headers: [params.CorrelationIdHeader],
      body: {
        content: {
          [applicationJson]: {
            schema: schemas.OrganizationCreateRequestApiSchema,
            example: organizationFactory.default(),
            examples: {
              default: {
                value: organizationFactory.default(),
              },
            },
          },
        },
      },
    },
    responses: {
      [HttpCodes.created]: {
        description: 'Created organization',
        content: {
          [applicationJson]: {
            schema: OrganizationResponseSchema,
          },
        },
      },
    },
  });
}
