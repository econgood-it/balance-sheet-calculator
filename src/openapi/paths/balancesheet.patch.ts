import { BalanceSheetPaths } from '../../controllers/balance.sheet.controller';
import { z } from 'zod';

import {
  applicationJson,
  HttpCodes,
  Methods,
  replaceExpressParamsByOpenApiParams,
  Tags,
} from './paths';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { OpenApiParams } from '../params';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import {
  BalanceSheetPatchRequestBodySchema,
  BalanceSheetResponseBodySchema,
} from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import { makeJsonFactory } from '../examples';

export function registerBalanceSheetPatch(
  registry: OpenAPIRegistry,
  params: OpenApiParams
) {
  registry.registerPath({
    method: Methods.patch,
    path: replaceExpressParamsByOpenApiParams(BalanceSheetPaths.patch),
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
            schema: BalanceSheetPatchRequestBodySchema,
            examples: {
              default: {
                value: makeJsonFactory().emptyFullV508(),
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
