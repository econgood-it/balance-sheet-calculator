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
import {
  OrganizationItemsResponseSchema,
  OrganizationResponseSchema,
} from '@ecogood/e-calculator-schemas/dist/organization.dto';
import { z } from 'zod';
import { BalanceSheetItemsResponseSchema } from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';

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

  registry.registerPath({
    method: Methods.get,
    path: replaceExpressIdByOpenApiId(OrganizationPaths.get),
    tags: [Tags.organization],
    description: 'Get organization by id',
    summary: 'Get organization',

    request: {
      headers: [params.CorrelationIdHeader],
      query: z.object({
        lng: params.LanguageParam,
      }),
      params: z.object({ id: params.OrganizationIdParam }),
    },
    responses: {
      [HttpCodes.okey]: {
        description: 'Organization for given id',
        content: {
          [applicationJson]: {
            schema: OrganizationResponseSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: Methods.get,
    path: replaceExpressIdByOpenApiId(OrganizationPaths.orgaBalanceSheet),
    tags: [Tags.organization],
    description: 'Get all balance sheets of organization',
    summary: 'Get all balance sheets of organization',

    request: {
      params: z.object({ id: params.OrganizationIdParam }),
      headers: [params.CorrelationIdHeader],
    },
    responses: {
      [HttpCodes.okey]: {
        description: 'Ids of balance sheet which are assigned to organization',
        content: {
          [applicationJson]: {
            schema: BalanceSheetItemsResponseSchema,
          },
        },
      },
    },
  });
}
