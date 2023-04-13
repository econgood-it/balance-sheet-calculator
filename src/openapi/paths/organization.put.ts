import { organizationFactory } from '../examples';

import {
  applicationJson,
  HttpCodes,
  Methods,
  replaceExpressIdByOpenApiId,
  Tags,
} from './paths';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { OpenApiSchemas } from '../schemas';
import { OpenApiParams } from '../params';
import { OrganizationPaths } from '../../controllers/organization.controller';
import { OrganizationResponseSchema } from '@ecogood/e-calculator-schemas/dist/organization.dto';
import { z } from 'zod';

export function registerOrganizationPut(
  registry: OpenAPIRegistry,
  schemas: OpenApiSchemas,
  params: OpenApiParams
) {
  registry.registerPath({
    method: Methods.put,
    path: replaceExpressIdByOpenApiId(OrganizationPaths.put),
    tags: [Tags.organization],
    description: 'Update a new organization',
    summary: 'Put organization',

    request: {
      headers: [params.CorrelationIdHeader],
      params: z.object({ id: params.OrganizationIdParam }),
      body: {
        content: {
          [applicationJson]: {
            schema: schemas.OrganizationPutRequestApiSchema,
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
        description: 'Updated organization',
        content: {
          [applicationJson]: {
            schema: OrganizationResponseSchema,
          },
        },
      },
    },
  });
}
