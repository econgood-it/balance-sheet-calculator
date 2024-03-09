import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { OpenApiParams } from '../params';
import { UserPaths } from '../../controllers/user.controller';
import { Methods, Tags } from './paths';
import { UserInvitationResponseSchema } from '@ecogood/e-calculator-schemas/dist/user.schema';

export function registerUserGet(
  registry: OpenAPIRegistry,
  params: OpenApiParams
) {
  registry.registerPath({
    method: Methods.get,
    path: UserPaths.getInvitation,
    tags: [Tags.user],
    description: 'Get invitations of current user',
    summary: 'Get invitations of current user',

    request: {
      headers: [params.CorrelationIdHeader],
    },
    responses: {
      200: {
        description: 'Get organizations user is invited to.',
        content: {
          'application/json': {
            schema: UserInvitationResponseSchema,
          },
        },
      },
    },
  });
}
