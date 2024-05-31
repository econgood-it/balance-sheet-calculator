import { makeJsonFactory } from '../examples';

import { applicationJson, HttpCodes, Methods, Tags } from './paths';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { OpenApiParams } from '../params';

import {
  BalanceSheetCreateRequestBodySchema,
  BalanceSheetResponseBodySchema,
} from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import { BalanceSheetPaths } from '../../controllers/balance.sheet.controller';
import { MatrixBodySchema } from '@ecogood/e-calculator-schemas/dist/matrix.dto';

export function registerBalanceSheetPost(
  registry: OpenAPIRegistry,
  params: OpenApiParams
) {
  registry.registerPath({
    method: Methods.post,
    path: BalanceSheetPaths.post,
    tags: [Tags.balanceSheets],
    description: 'Calculates points for balance sheet',
    summary: 'Calculates points for balance sheet',

    request: {
      headers: [params.CorrelationIdHeader],
      body: {
        content: {
          [applicationJson]: {
            schema: BalanceSheetCreateRequestBodySchema,
            examples: {
              'Full 5.08': {
                value: makeJsonFactory().emptyFullV508(),
              },
            },
          },
        },
      },
    },
    responses: {
      [HttpCodes.created]: {
        description: 'Balance sheet with calculated points',
        content: {
          [applicationJson]: {
            schema: BalanceSheetResponseBodySchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: Methods.post,
    path: BalanceSheetPaths.matrixWithoutSave,
    tags: [Tags.balanceSheets],
    description: 'Calculates matrix for balance sheet',
    summary: 'Calculates matrix for balance sheet',

    request: {
      headers: [params.CorrelationIdHeader],
      body: {
        content: {
          [applicationJson]: {
            schema: BalanceSheetCreateRequestBodySchema,
            examples: {
              'Full 5.08': {
                value: makeJsonFactory().emptyFullV508(),
              },
            },
          },
        },
      },
    },
    responses: {
      [HttpCodes.created]: {
        description: 'Balance sheet with calculated points',
        content: {
          [applicationJson]: {
            schema: MatrixBodySchema,
          },
        },
      },
    },
  });
}
