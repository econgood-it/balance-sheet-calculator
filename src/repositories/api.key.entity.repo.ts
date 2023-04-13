import { EntityManager, Repository } from 'typeorm';
import { API_KEY_RELATIONS, ApiKey } from '../entities/api.key';

export interface IApiKeyRepo {
  findByIdOrFail(id: number): Promise<ApiKey>;
  save(apiKey: ApiKey): Promise<ApiKey>;
  remove(apiKey: ApiKey): Promise<ApiKey>;
}

export class ApiKeyRepository implements IApiKeyRepo {
  private repo: Repository<ApiKey>;
  constructor(manager: EntityManager) {
    this.repo = manager.getRepository(ApiKey);
  }

  findByIdOrFail(id: number): Promise<ApiKey> {
    return this.repo.findOneOrFail({
      where: { id: id },
      relations: API_KEY_RELATIONS,
    });
  }

  remove(apiKey: ApiKey): Promise<ApiKey> {
    return this.repo.remove(apiKey);
  }

  save(apiKey: ApiKey): Promise<ApiKey> {
    return this.repo.save(apiKey);
  }
}
