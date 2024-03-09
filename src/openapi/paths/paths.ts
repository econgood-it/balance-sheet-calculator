import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { OpenApiParams } from '../params';

import { registerBalanceSheetDelete } from './balancesheet.delete';
import { registerBalanceSheetGet } from './balancesheet.get';
import { registerBalanceSheetPatch } from './balancesheet.patch';
import { registerOrganizationGet } from './organization.get';
import { registerOrganizationPost } from './organization.post';
import { registerOrganizationPut } from './organization.put';
import { registerWorkbookGet } from './workbook.get';
import { registerUserGet } from './user.get';
import { registerUserPatch } from './user.patch';

export const Tags = {
  balanceSheets: 'balancesheets',
  organization: 'organization',
  user: 'user',
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

export function replaceExpressParamsByOpenApiParams(expressPath: string) {
  return expressPath.replace(':id', '{id}').replace(':email', '{email}');
}

export const applicationJson = 'application/json';
export function registerPaths(
  registry: OpenAPIRegistry,
  params: OpenApiParams
) {
  registerBalanceSheetGet(registry, params);
  registerBalanceSheetPatch(registry, params);
  registerBalanceSheetDelete(registry, params);
  registerOrganizationPost(registry, params);
  registerOrganizationPut(registry, params);
  registerUserGet(registry, params);
  registerUserPatch(registry, params);
  registerWorkbookGet(registry, params);
  registerOrganizationGet(registry, params);
}
