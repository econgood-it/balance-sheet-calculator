import {
  OpenAPIGenerator,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';
import { OpenAPIObject } from 'openapi3-ts';
import { registerSchemas } from './schemas';
import { registerParams } from './params';
import { registerPaths } from './paths/paths';
import { Configuration, Environment } from '../reader/configuration.reader';

export function buildSwaggerDoc(configuration: Configuration): OpenAPIObject {
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

  const version = '3.4.6';

  const devServer = {
    url: 'http://localhost:4000',
    description: 'Local development server',
  };
  const testServer = {
    url: 'https://balance-sheet-api.dev.econgood.org',
    description: 'Test server',
  };
  const prodServer = {
    url: 'https://balance-sheet-api.prod.econgood.org',
    description: 'Production server',
  };

  const servers =
    configuration.environment === Environment.DEV
      ? [devServer, testServer, prodServer]
      : configuration.environment === Environment.TEST
      ? [testServer, prodServer]
      : [prodServer, testServer];

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
    servers,
    security: [{ [apiKeyAuth.name]: [] }],
  });
}
