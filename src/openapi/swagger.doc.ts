import {
  OpenAPIGenerator,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';
import { OpenAPIObject } from 'openapi3-ts';
import { registerSchemas } from './schemas';
import { registerParams } from './params';
import { registerPaths } from './paths/paths';

export function buildSwaggerDoc(): OpenAPIObject {
  const registry = new OpenAPIRegistry();

  const apiKeyAuth = registry.registerComponent('securitySchemes', 'apiKey', {
    type: 'apiKey',
    in: 'header',
    name: 'Api-Key',
  });

  const params = registerParams(registry);
  const schemas = registerSchemas(registry);

  registerPaths(registry, schemas, params);

  const generator = new OpenAPIGenerator(registry.definitions, '3.0.0');

  const version = '3.4.0';

  return generator.generateDocument({
    info: {
      title: `ECG Balance Calculator ${version}`,
      version: '3.4.0',
      description:
        'In the moment the ECG ratings for a company are calculated by a Excel file. The idea of this API is to replace the Excel file in the future.',
    },
    externalDocs: {
      url: 'https://wiki.ecogood.org/pages/viewpage.action?pageId=69436026&scmLanguageKey=en',
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Local development server' },
      {
        url: 'https://calculator.test.ecogood.org',
        description: 'Test server',
      },
      {
        url: 'https://calculator.ecogood.org',
        description: 'Production server',
      },
    ],
    security: [{ [apiKeyAuth.name]: [] }],
  });
}
