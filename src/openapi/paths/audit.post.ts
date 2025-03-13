import { applicationJson, HttpCodes, Methods, Tags } from './paths';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { OpenApiParams } from '../params';
import { AuditPaths } from '../../controllers/audit.controller';
import {
  AuditSubmitRequestBodySchema,
  AuditSubmitResponseBodySchema,
} from '@ecogood/e-calculator-schemas/dist/audit.dto';

export function registerAuditPost(
  registry: OpenAPIRegistry,
  params: OpenApiParams
) {
  registry.registerPath({
    method: Methods.post,
    path: AuditPaths.post,
    tags: [Tags.audit],
    description: 'Submit balance sheet to audit',
    summary: 'Submit balance sheet to audit',

    request: {
      headers: [params.CorrelationIdHeader],
      body: {
        content: {
          [applicationJson]: {
            schema: AuditSubmitRequestBodySchema,
            examples: {
              Default: {
                balanceSheetToBeSubmitted: 8,
              },
            },
          },
        },
      },
    },
    responses: {
      [HttpCodes.created]: {
        description: 'Created audit instance with its id',
        content: {
          [applicationJson]: {
            schema: AuditSubmitResponseBodySchema,
          },
        },
      },
    },
  });
}
