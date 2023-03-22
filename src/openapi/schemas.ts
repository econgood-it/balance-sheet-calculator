import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  BalanceSheetCreateRequestBodySchema,
  BalanceSheetPatchRequestBodySchema,
} from 'e-calculator-schemas/dist/balance.sheet.dto';

export type OpenApiSchemas = {
  BalanceSheetCreateRequestApiSchema: any;
  BalanceSheetPatchRequestApiSchema: any;
};

export function registerSchemas(registry: OpenAPIRegistry): OpenApiSchemas {
  const BalanceSheetCreateRequestApiSchema = registry.register(
    'BalanceSheetRequest',
    BalanceSheetCreateRequestBodySchema
  );
  const BalanceSheetPatchRequestApiSchema = registry.register(
    'BalanceSheetPatchRequest',
    BalanceSheetPatchRequestBodySchema
  );
  return {
    BalanceSheetCreateRequestApiSchema,
    BalanceSheetPatchRequestApiSchema,
  };
}
