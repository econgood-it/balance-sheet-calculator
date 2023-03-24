import { BalanceSheetPaths } from '../../controllers/balance.sheet.controller';
import { z } from 'zod';
import { balanceSheetJsonFactory } from '../examples';

import { applicationJson, HttpCodes, Methods, Tags } from './paths';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { OpenApiSchemas } from '../schemas';
import { OpenApiParams } from '../params';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { BalanceSheetResponseBodySchema } from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';

export function registerBalanceSheetPost(
  registry: OpenAPIRegistry,
  schemas: OpenApiSchemas,
  params: OpenApiParams
) {
  registry.registerPath({
    method: Methods.post,
    path: BalanceSheetPaths.post,
    tags: [Tags.balanceSheets],
    description: 'Create a new balance sheet',
    summary: 'Post balance sheet',

    request: {
      headers: [params.CorrelationIdHeader],
      query: z.object({
        save: params.SaveFlagParam,
        lng: params.LanguageParam,
      }),
      body: {
        content: {
          [applicationJson]: {
            schema: schemas.BalanceSheetCreateRequestApiSchema,
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
