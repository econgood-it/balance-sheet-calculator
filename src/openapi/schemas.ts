import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  BalanceSheetCreateRequestBodySchema,
  BalanceSheetPatchRequestBodySchema,
} from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import { OrganizationRequestSchema } from '@ecogood/e-calculator-schemas/dist/organization.dto';

export type OpenApiSchemas = {
  BalanceSheetCreateRequestApiSchema: any;
  BalanceSheetPatchRequestApiSchema: any;
  OrganizationCreateRequestApiSchema: any;
  OrganizationPutRequestApiSchema: any;
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
  const OrganizationCreateRequestApiSchema = registry.register(
    'BalanceSheetPatchRequest',
    OrganizationRequestSchema
  );
  return {
    BalanceSheetCreateRequestApiSchema,
    BalanceSheetPatchRequestApiSchema,
    OrganizationCreateRequestApiSchema,
    OrganizationPutRequestApiSchema: OrganizationCreateRequestApiSchema,
  };
}
