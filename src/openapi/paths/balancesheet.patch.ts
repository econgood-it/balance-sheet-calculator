import { BalanceSheetPaths } from '../../controllers/balance.sheet.controller';
import { z } from 'zod';
import { balanceSheetJsonFactory } from '../examples';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '../../models/balance.sheet';
import { BalanceSheetResponseBodySchema } from '../../dto/balance.sheet.dto';
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
                value: balanceSheetJsonFactory.emptyV508(),
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
