import { EntityManager } from 'typeorm';
import {
  IOrganizationEntityRepo,
  OrganizationEntityRepository,
} from './organization.entity.repo';
import { IUserEntityRepo, UserEntityRepository } from './user.entity.repo';
import {
  BalanceSheetEntityRepository,
  IBalanceSheetEntityRepo,
} from './balance.sheet.entity.repo';
import { ApiKeyRepository, IApiKeyRepo } from './api.key.entity.repo';
import {
  InMemoryWorkbookEntityRepo,
  IWorkbookEntityRepo,
  WorkbookEntityRepo,
} from './workbook.entity.repo';
import { Configuration } from '../reader/configuration.reader';

export interface IRepoProvider {
  getOrganizationEntityRepo(
    entityManager: EntityManager
  ): IOrganizationEntityRepo;

  getBalanceSheetEntityRepo(
    entityManager: EntityManager
  ): IBalanceSheetEntityRepo;

  getUserEntityRepo(entityManager: EntityManager): IUserEntityRepo;
  getApiKeyRepo(entityManager: EntityManager): IApiKeyRepo;
  getWorkbookEntityRepo(): IWorkbookEntityRepo;
}

export class RepoProvider implements IRepoProvider {
  constructor(private configuration: Configuration) {}
  getOrganizationEntityRepo(
    entityManager: EntityManager
  ): IOrganizationEntityRepo {
    return new OrganizationEntityRepository(entityManager);
  }

  getUserEntityRepo(entityManager: EntityManager): IUserEntityRepo {
    return new UserEntityRepository(entityManager);
  }

  getBalanceSheetEntityRepo(
    entityManager: EntityManager
  ): IBalanceSheetEntityRepo {
    return new BalanceSheetEntityRepository(entityManager);
  }

  getApiKeyRepo(entityManager: EntityManager): IApiKeyRepo {
    return new ApiKeyRepository(entityManager);
  }

  getWorkbookEntityRepo(): IWorkbookEntityRepo {
    return new WorkbookEntityRepo(this.configuration.workbookApiToken);
  }
}

export class InMemoryRepoProvider implements IRepoProvider {
  constructor(private inMemoryWorkbookEntityRepo: InMemoryWorkbookEntityRepo) {}

  getOrganizationEntityRepo(
    entityManager: EntityManager
  ): IOrganizationEntityRepo {
    return new OrganizationEntityRepository(entityManager);
  }

  getUserEntityRepo(entityManager: EntityManager): IUserEntityRepo {
    return new UserEntityRepository(entityManager);
  }

  getBalanceSheetEntityRepo(
    entityManager: EntityManager
  ): IBalanceSheetEntityRepo {
    return new BalanceSheetEntityRepository(entityManager);
  }

  getApiKeyRepo(entityManager: EntityManager): IApiKeyRepo {
    return new ApiKeyRepository(entityManager);
  }

  getWorkbookEntityRepo(): IWorkbookEntityRepo {
    return this.inMemoryWorkbookEntityRepo;
  }
}
