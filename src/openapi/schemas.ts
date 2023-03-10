import {
  BalanceSheetCreateRequestBodySchema,
  BalanceSheetPatchRequestBodySchema,
} from '../dto/balance.sheet.dto';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

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
    BalanceSheetCreateRequestApiSchema: BalanceSheetCreateRequestApiSchema,
    BalanceSheetPatchRequestApiSchema: BalanceSheetPatchRequestApiSchema,
  };
}
