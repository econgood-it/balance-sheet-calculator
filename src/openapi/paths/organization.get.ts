import { applicationJson, HttpCodes, Methods, Tags } from './paths';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { OpenApiSchemas } from '../schemas';
import { OpenApiParams } from '../params';
import { OrganizationPaths } from '../../controllers/organization.controller';
import { OrganizationItemsResponseSchema } from '@ecogood/e-calculator-schemas/dist/organization.dto';

export function registerOrganizationGet(
  registry: OpenAPIRegistry,
  schemas: OpenApiSchemas,
  params: OpenApiParams
) {
  registry.registerPath({
    method: Methods.get,
    path: OrganizationPaths.getAll,
    tags: [Tags.organization],
    description: 'Get all organizations of the current user',
    summary: 'Get organizations',

    request: {
      headers: [params.CorrelationIdHeader],
    },
    responses: {
      [HttpCodes.okey]: {
        description: 'Organizations of current user',
        content: {
          [applicationJson]: {
            schema: OrganizationItemsResponseSchema,
          },
        },
      },
    },
  });
}
