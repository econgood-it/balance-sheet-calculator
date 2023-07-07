import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { OpenApiSchemas } from '../schemas';
import { OpenApiParams } from '../params';
import { registerBalanceSheetPost } from './balancesheet.post';
import { registerBalanceSheetGet } from './balancesheet.get';
import { registerBalanceSheetDelete } from './balancesheet.delete';
import { registerBalanceSheetPatch } from './balancesheet.patch';
import { registerOrganizationPost } from './organization.post';
import { registerOrganizationPut } from './organization.put';
import { registerWorkbookGet } from './workbook.get';
import { registerOrganizationGet } from './organization.get';
export const Tags = {
  balanceSheets: 'balancesheets',
  organization: 'organization',
  workbook: 'workbook',
};
export const Methods: {
  [name: string]: 'get' | 'post' | 'put' | 'delete' | 'patch';
} = {
  post: 'post',
  put: 'put',
  get: 'get',
  delete: 'delete',
  patch: 'patch',
};
export const HttpCodes = {
  created: 201,
  okey: 200,
};

export function replaceExpressIdByOpenApiId(expressPath: string) {
  return expressPath.replace(':id', '{id}');
}

export const applicationJson = 'application/json';
export function registerPaths(
  registry: OpenAPIRegistry,
  schemas: OpenApiSchemas,
  params: OpenApiParams
) {
  registerBalanceSheetGet(registry, schemas, params);
  registerBalanceSheetPost(registry, schemas, params);
  registerBalanceSheetPatch(registry, schemas, params);
  registerBalanceSheetDelete(registry, schemas, params);
  registerOrganizationPost(registry, schemas, params);
  registerOrganizationPut(registry, schemas, params);
  registerWorkbookGet(registry, schemas, params);
  registerOrganizationGet(registry, schemas, params);
}
