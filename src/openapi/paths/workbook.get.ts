import { applicationJson, HttpCodes, Methods, Tags } from './paths';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { OpenApiSchemas } from '../schemas';
import { OpenApiParams } from '../params';
import { WorkbookPaths } from '../../controllers/workbook.controller';
import { WorkbookResponseBodySchema } from '@ecogood/e-calculator-schemas/dist/workbook.dto';
import { WorkbookSectionsJsonFactory } from '../examples';

export function registerWorkbookGet(
  registry: OpenAPIRegistry,
  schemas: OpenApiSchemas,
  params: OpenApiParams
) {
  registry.registerPath({
    method: Methods.get,
    path: WorkbookPaths.get,
    tags: [Tags.workbook],
    description: 'Get workbook',
    summary: 'Get workbook',

    request: {
      headers: [params.CorrelationIdHeader],
    },
    responses: {
      [HttpCodes.okey]: {
        description: 'Workbook',
        content: {
          [applicationJson]: {
            schema: WorkbookResponseBodySchema,
            example: WorkbookSectionsJsonFactory.default(),
          },
        },
      },
    },
  });
}
