import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { OpenApiParams } from '../params';
import { UserPaths } from '../../controllers/user.controller';
import { Methods, replaceExpressParamsByOpenApiParams, Tags } from './paths';

export function registerUserPatch(
  registry: OpenAPIRegistry,
  params: OpenApiParams
) {
  registry.registerPath({
    method: Methods.patch,
    path: replaceExpressParamsByOpenApiParams(UserPaths.joinOrganization),
    tags: [Tags.user],
    description: 'Join organization as current user',
    summary: 'Join organization as current user',

    request: {
      headers: [params.CorrelationIdHeader],
    },
    responses: {
      200: {
        description: 'Join organization as current user.',
      },
      403: {
        description: 'User is not allowed to join organization.',
      },
      404: {
        description: 'Organization not found.',
      },
    },
  });
}
