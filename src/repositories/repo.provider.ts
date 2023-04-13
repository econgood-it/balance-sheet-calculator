import { DataSource, EntityManager } from 'typeorm';
import {
  IOrganizationEntityRepo,
  OrganizationEntityRepository,
} from './organization.entity.repo';
import { IUserEntityRepo, UserEntityRepository } from './user.entity.repo';
import {
  BalanceSheetEntityRepository,
  IBalanceSheetEntityRepo,
} from './balance.sheet.entity.repo';

export interface IRepoProvider {
  getOrganizationEntityRepo(
    entityManager: EntityManager
  ): IOrganizationEntityRepo;

  getBalanceSheetEntityRepo(
    entityManager: EntityManager
  ): IBalanceSheetEntityRepo;

  getUserEntityRepo(entityManager: EntityManager): IUserEntityRepo;
}

export class RepoProvider implements IRepoProvider {
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
}
