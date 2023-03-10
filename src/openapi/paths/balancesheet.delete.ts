import { BalanceSheetPaths } from '../../controllers/balance.sheet.controller';
import { z } from 'zod';

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

export function registerBalanceSheetDelete(
  registry: OpenAPIRegistry,
  schemas: OpenApiSchemas,
  params: OpenApiParams
) {
  registry.registerPath({
    method: Methods.delete,
    path: replaceExpressIdByOpenApiId(BalanceSheetPaths.get),
    tags: [Tags.balanceSheets],
    description: 'Delete balance sheet by id',
    summary: 'Delete balance sheet',

    request: {
      headers: [params.CorrelationIdHeader],
      query: z.object({
        lng: params.LanguageParam,
      }),
      params: z.object({ id: params.BalanceSheetIdParam }),
    },
    responses: {
      [HttpCodes.okey]: {
        description: 'Deletion successful',
        content: {
          [applicationJson]: {
            schema: z.object({ message: z.string() }),
          },
        },
      },
    },
  });
}
