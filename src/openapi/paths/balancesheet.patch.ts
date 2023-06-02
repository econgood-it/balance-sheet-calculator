import { BalanceSheetPaths } from '../../controllers/balance.sheet.controller';
import { z } from 'zod';
import { balanceSheetJsonFactory } from '../examples';

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
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { BalanceSheetResponseBodySchema } from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';

export function registerBalanceSheetPatch(
  registry: OpenAPIRegistry,
  schemas: OpenApiSchemas,
  params: OpenApiParams
) {
  registry.registerPath({
    method: Methods.patch,
    path: replaceExpressIdByOpenApiId(BalanceSheetPaths.patch),
    tags: [Tags.balanceSheets],
    description: 'Update a new balance sheet',
    summary: 'Patch balance sheet',

    request: {
      headers: [params.CorrelationIdHeader],
      query: z.object({
        save: params.SaveFlagParam,
        lng: params.LanguageParam,
      }),
      params: z.object({ id: params.BalanceSheetIdParam }),
      body: {
        content: {
          [applicationJson]: {
            schema: schemas.BalanceSheetPatchRequestApiSchema,
            examples: {
              default: {
                value: balanceSheetJsonFactory.emptyFullV508(),
              },
              minimal: {
                value: {
                  type: BalanceSheetType.Full,
                  version: BalanceSheetVersion.v5_0_8,
                },
              },
            },
          },
        },
      },
    },
    responses: {
      [HttpCodes.okey]: {
        description: 'Updated balance sheet',
        content: {
          [applicationJson]: {
            schema: BalanceSheetResponseBodySchema,
          },
        },
      },
    },
  });
}
