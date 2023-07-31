import {
  balanceSheetFactory,
  balanceSheetJsonFactory,
  organizationFactory,
} from '../examples';

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
import { BalanceSheetResponseBodySchema } from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import { z } from 'zod';

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

  registry.registerPath({
    method: Methods.post,
    path: replaceExpressIdByOpenApiId(OrganizationPaths.postBalanceSheet),
    tags: [Tags.organization],
    description: 'Create balance sheet for organization',
    summary: 'Create balance sheet for organization',

    request: {
      params: z.object({ id: params.OrganizationIdParam }),
      headers: [params.CorrelationIdHeader],
      body: {
        content: {
          [applicationJson]: {
            schema: schemas.BalanceSheetCreateRequestApiSchema,
            examples: {
              'Full 5.08': {
                value: balanceSheetJsonFactory.emptyFullV508(),
              },
            },
          },
        },
      },
    },
    responses: {
      [HttpCodes.created]: {
        description: 'Created balance sheet',
        content: {
          [applicationJson]: {
            schema: BalanceSheetResponseBodySchema,
          },
        },
      },
    },
  });
}
