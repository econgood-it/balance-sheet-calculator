import { balanceSheetJsonFactory, oldOrganizationFactory } from '../examples';

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

export function registerOrganizationPost(
  registry: OpenAPIRegistry,
  params: OpenApiParams
) {
  registry.registerPath({
    method: Methods.post,
    path: OrganizationPaths.post,
    tags: [Tags.organization],
    description: 'Create a new organization',
    summary: 'Post organization',

    request: {
      headers: [params.CorrelationIdHeader],
      body: {
        content: {
          [applicationJson]: {
            schema: OrganizationRequestSchema,
            examples: {
              default: {
                value: oldOrganizationFactory.default(),
              },
            },
          },
        },
      },
    },
    responses: {
      [HttpCodes.created]: {
        description: 'Created organization',
        content: {
          [applicationJson]: {
            schema: OrganizationResponseSchema,
          },
        },
      },
    },
  });

  registry.registerPath({
    method: Methods.post,
    path: replaceExpressParamsByOpenApiParams(
      OrganizationPaths.orgaBalanceSheet
    ),
    tags: [Tags.organization],
    description: 'Create balance sheet for organization',
    summary: 'Create balance sheet for organization',

    request: {
      params: z.object({ id: params.OrganizationIdParam }),
      headers: [params.CorrelationIdHeader],
      body: {
        content: {
          [applicationJson]: {
            schema: BalanceSheetCreateRequestBodySchema,
            examples: {
              'Full 5.08': {
                value: balanceSheetJsonFactory.emptyFullV508(),
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
  registry.registerPath({
    method: Methods.post,
    path: replaceExpressParamsByOpenApiParams(OrganizationPaths.orgaInvitation),
    tags: [Tags.organization],
    description: 'Invite user to organization',
    summary: 'Invite user to organization',
    request: {
      params: z.object({
        id: params.OrganizationIdParam,
        email: params.InvitationEmailParam,
      }),
      headers: [params.CorrelationIdHeader],
    },
    responses: {
      [HttpCodes.created]: {
        description: 'Created',
      },
    },
  });
}
