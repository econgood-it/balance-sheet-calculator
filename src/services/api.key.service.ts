import { NextFunction, Request, Response } from 'express';
import { Connection } from 'typeorm';
import { User } from '../entities/user';
import { handle } from '../exceptions/error.handler';
import { API_KEY_RELATIONS, ApiKey } from '../entities/api.key';
import UnauthorizedException from '../exceptions/unauthorized.exception';

export class ApiKeyService {
  constructor(private connection: Connection) {}

  public async createApiKey(req: Request, res: Response, next: NextFunction) {
    this.connection.manager
      .transaction(async (entityManager) => {
        if (req.userInfo === undefined || req.userInfo.id === undefined) {
          throw new Error('User undefined');
        }
        const userId = req.userInfo.id;

        const userRepository = entityManager.getRepository(User);
        const foundUser = await userRepository.findOneOrFail({
          where: { id: userId },
        });

        const apiKey = new ApiKey(undefined, undefined, foundUser);
        const apiKeyValueBeforeHashing = apiKey.value;

        const apiKeyRepository = entityManager.getRepository(ApiKey);
        const result = await apiKeyRepository.save(apiKey);
        res.json({
          apiKey: `${result.id}.${apiKeyValueBeforeHashing}`,
        });
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  public async deleteApiKey(req: Request, res: Response, next: NextFunction) {
    this.connection.manager
      .transaction(async (entityManager) => {
        if (req.userInfo === undefined || req.userInfo.id === undefined) {
          throw new Error('User undefined');
        }
        const userId = req.userInfo.id;
        const apiKeyId: number = Number(req.params.id);

        const apiKeyRepository = entityManager.getRepository(ApiKey);
        const result = await apiKeyRepository.findOneOrFail({
          where: { id: apiKeyId },
          relations: API_KEY_RELATIONS,
        });
        if (result?.user.id !== userId) {
          throw new UnauthorizedException(
            'User has no permission to delete api key'
          );
        }

        await apiKeyRepository.remove(result);

        res.json({
          message: `Deleted balance sheet with id ${apiKeyId}`,
        });
      })
      .catch((error) => {
        handle(error, next);
      });
  }
}
