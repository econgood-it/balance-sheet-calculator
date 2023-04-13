import { z } from 'zod';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

export type OpenApiParams = {
  CorrelationIdHeader: any;
  SaveFlagParam: any;
  LanguageParam: any;
  BalanceSheetIdParam: any;
  OrganizationIdParam: any;
};

export function registerParams(registry: OpenAPIRegistry) {
  const CorrelationIdHeader = registry.registerParameter(
    'CorrelationId',
    z.ostring().openapi({
      param: {
        name: 'x-correlation-id',
        in: 'header',
        description:
          "If x-correlation-id is set then it's value will be used as the id for this request, otherwise the id will be a new uuid.",
      },
      example: 'my-own-correlation-id',
    })
  );

  const SaveFlagParam = registry.registerParameter(
    'SaveFlag',
    z
      .oboolean()
      .default(true)
      .openapi({
        param: {
          name: 'save',
          in: 'query',
          description:
            'If true, the results of the balance sheet calculations are saved in the database. Otherwise, not.',
        },
      })
  );

  const BalanceSheetIdParam = registry.registerParameter(
    'BalanceSheetId',
    z.string().openapi({
      param: {
        name: 'id',
        in: 'path',
        description: 'The id of the balance sheet',
      },
    })
  );

  const OrganizationIdParam = registry.registerParameter(
    'OrganizationId',
    z.string().openapi({
      param: {
        name: 'id',
        in: 'path',
        description: 'The id of the organization',
      },
    })
  );

  const LanguageParam = registry.registerParameter(
    'Language',
    z
      .enum(['en', 'de'])
      .optional()
      .default('en')
      .openapi({
        param: {
          name: 'lng',
          in: 'query',
          description:
            'Choose the language. All words are translated to the given language.',
        },
      })
  );
  return {
    CorrelationIdHeader,
    SaveFlagParam,
    LanguageParam,
    BalanceSheetIdParam,
    OrganizationIdParam,
  };
}
