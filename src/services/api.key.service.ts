import { NextFunction, Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { handle } from '../exceptions/error.handler';
import { ApiKey } from '../entities/api.key';
import UnauthorizedException from '../exceptions/unauthorized.exception';
import { IRepoProvider } from '../repositories/repo.provider';

export class ApiKeyService {
  constructor(
    private dataSource: DataSource,
    private repoProvider: IRepoProvider
  ) {}

  public async createApiKey(req: Request, res: Response, next: NextFunction) {
    this.dataSource.manager
      .transaction(async (entityManager) => {
        if (req.userInfo === undefined || req.userInfo.id === undefined) {
          throw new Error('User undefined');
        }
        const userId = req.userInfo.id;

        const userRepository =
          this.repoProvider.getUserEntityRepo(entityManager);
        const foundUser = await userRepository.findByIdOrFail(userId);

        const apiKey = new ApiKey(undefined, undefined, foundUser);
        const apiKeyValueBeforeHashing = apiKey.value;

        const apiKeyRepository = this.repoProvider.getApiKeyRepo(entityManager);
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
    this.dataSource.manager
      .transaction(async (entityManager) => {
        if (req.userInfo === undefined || req.userInfo.id === undefined) {
          throw new Error('User undefined');
        }
        const userId = req.userInfo.id;
        const apiKeyId: number = Number(req.params.id);

        const apiKeyRepository = this.repoProvider.getApiKeyRepo(entityManager);
        const result = await apiKeyRepository.findByIdOrFail(apiKeyId);
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
