import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { BalanceSheetPaths } from '../../controllers/balance.sheet.controller';
import { z } from 'zod';
import { balanceSheetJsonFactory } from '../examples';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '../../models/balance.sheet';
import {
  BalanceSheetIdsResponseSchema,
  BalanceSheetResponseBodySchema,
} from '../../dto/balance.sheet.dto';
import { OpenApiSchemas } from '../schemas';
import { OpenApiParams } from '../params';
import { registerBalanceSheetPost } from './balancesheet.post';
import { registerBalanceSheetGet } from './balancesheet.get';
import { registerBalanceSheetDelete } from './balancesheet.delete';
import { registerBalanceSheetPatch } from './balancesheet.patch';
export const Tags = {
  balanceSheets: 'balancesheets',
};
export const Methods: {
  [name: string]: 'get' | 'post' | 'put' | 'delete' | 'patch';
} = {
  post: 'post',
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
}
