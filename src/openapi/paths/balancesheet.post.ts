import { makeJsonFactory, organizationJsonFactory } from '../examples';

import {
  applicationJson,
  HttpCodes,
  Methods,
  replaceExpressParamsByOpenApiParams,
  Tags,
} from './paths';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { OpenApiParams } from '../params';
import { OrganizationPaths } from '../../controllers/organization.controller';
import {
  OrganizationRequestSchema,
  OrganizationResponseSchema,
} from '@ecogood/e-calculator-schemas/dist/organization.dto';
import {
  BalanceSheetCreateRequestBodySchema,
  BalanceSheetResponseBodySchema,
} from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import { z } from 'zod';
import { BalanceSheetPaths } from '../../controllers/balance.sheet.controller';

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
}
