import { BalanceSheetPaths } from '../../controllers/balance.sheet.controller';
import { z } from 'zod';
import {
  BalanceSheetIdsResponseSchema,
  BalanceSheetResponseBodySchema,
} from '../../dto/balance.sheet.dto';
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

export function registerBalanceSheetGet(
  registry: OpenAPIRegistry,
  schemas: OpenApiSchemas,
  params: OpenApiParams
) {
  registry.registerPath({
    method: Methods.get,
    path: BalanceSheetPaths.getAll,
    tags: [Tags.balanceSheets],
    description: 'Get all balance sheets of the current user',
    summary: 'Get balance sheets',

    request: {
      headers: [params.CorrelationIdHeader],
      query: z.object({
        lng: params.LanguageParam,
      }),
    },
    responses: {
      [HttpCodes.okey]: {
        description: 'Balance sheet of current user',
        content: {
          [applicationJson]: {
            schema: BalanceSheetIdsResponseSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: Methods.get,
    path: replaceExpressIdByOpenApiId(BalanceSheetPaths.get),
    tags: [Tags.balanceSheets],
    description: 'Get balance sheet by id',
    summary: 'Get balance sheet',

    request: {
      headers: [params.CorrelationIdHeader],
      query: z.object({
        lng: params.LanguageParam,
      }),
      params: z.object({ id: params.BalanceSheetIdParam }),
    },
    responses: {
      [HttpCodes.okey]: {
        description: 'Balance sheet for given id',
        content: {
          [applicationJson]: {
            schema: BalanceSheetResponseBodySchema,
          },
        },
      },
    },
  });
}
