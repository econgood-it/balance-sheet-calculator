import {
  OpenAPIGenerator,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';
import { OpenAPIObject } from 'openapi3-ts';
import { Configuration, Environment } from '../reader/configuration.reader';
import { registerParams } from './params';
import { registerPaths } from './paths/paths';

export function buildSwaggerDoc(configuration: Configuration): OpenAPIObject {
  const registry = new OpenAPIRegistry();

  const oauth2SecuritySchema = registry.registerComponent(
    'securitySchemes',
    'oauth2',
    {
      type: 'oauth2',
      flows: {
        authorizationCode: {
          authorizationUrl:
            'https://zitadel.dev.econgood.org:443/oauth/v2/authorize',
          tokenUrl: 'https://zitadel.dev.econgood.org:443/oauth/v2/token',
          scopes: {
            openid: 'openid',
            email: 'email',
          },
        },
      },
    }
  );

  const params = registerParams(registry);

  registerPaths(registry, params);

  const generator = new OpenAPIGenerator(registry.definitions, '3.0.0');

  const version = '3.7.1';

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
      version,
      description:
        'In the moment the ECG ratings for a company are calculated by a Excel file. The idea of this API is to replace the Excel file in the future.',
    },
    externalDocs: {
      url: 'https://wiki.ecogood.org/pages/viewpage.action?pageId=69436026&scmLanguageKey=en',
    },
    servers,
    security: [{ [oauth2SecuritySchema.name]: [] }],
  });
}
