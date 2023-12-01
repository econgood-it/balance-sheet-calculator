import { z } from 'zod';
import { BalanceSheetPaths } from '../../controllers/balance.sheet.controller';

import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { BalanceSheetResponseBodySchema } from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import { MatrixBodySchema } from '@ecogood/e-calculator-schemas/dist/matrix.dto';
import { OpenApiParams } from '../params';
import { OpenApiSchemas } from '../schemas';
import {
  applicationJson,
  HttpCodes,
  Methods,
  replaceExpressIdByOpenApiId,
  Tags,
} from './paths';

export function registerBalanceSheetGet(
  registry: OpenAPIRegistry,
  schemas: OpenApiSchemas,
  params: OpenApiParams
) {
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
  registry.registerPath({
    method: Methods.get,
    path: replaceExpressIdByOpenApiId(BalanceSheetPaths.matrix),
    tags: [Tags.balanceSheets],
    description: 'Get matrix representation of balance sheet',
    summary: 'Get matrix representation of balance sheet',

    request: {
      headers: [params.CorrelationIdHeader],
      query: z.object({
        lng: params.LanguageParam,
      }),
      params: z.object({ id: params.BalanceSheetIdParam }),
    },
    responses: {
      [HttpCodes.okey]: {
        description: 'Balance sheet as matrix for given id',
        content: {
          [applicationJson]: {
            schema: MatrixBodySchema,
          },
        },
      },
    },
  });
}
