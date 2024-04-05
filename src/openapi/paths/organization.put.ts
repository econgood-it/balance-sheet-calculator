import { oldOrganizationFactory } from '../examples';

import {
  applicationJson,
  HttpCodes,
  Methods,
  replaceExpressParamsByOpenApiParams,
  Tags,
} from './paths';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { OpenApiParams } from '../params';
import { OrganizationPaths } from '../../controllers/organization.controller';
import {
  OrganizationRequestSchema,
  OrganizationResponseSchema,
} from '@ecogood/e-calculator-schemas/dist/organization.dto';
import { z } from 'zod';

export function registerOrganizationPut(
  registry: OpenAPIRegistry,
  params: OpenApiParams
) {
  registry.registerPath({
    method: Methods.put,
    path: replaceExpressParamsByOpenApiParams(OrganizationPaths.put),
    tags: [Tags.organization],
    description: 'Update a new organization',
    summary: 'Put organization',

    request: {
      headers: [params.CorrelationIdHeader],
      params: z.object({ id: params.OrganizationIdParam }),
      body: {
        content: {
          [applicationJson]: {
            schema: OrganizationRequestSchema,
            examples: {
              default: {
                value: oldOrganizationFactory.default(),
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
