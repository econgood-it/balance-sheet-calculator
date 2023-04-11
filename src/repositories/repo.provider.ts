import { EntityManager } from 'typeorm';
import {
  IOrganizationEntityRepo,
  OrganizationEntityRepository,
} from './organization.entity.repo';
import { IUserEntityRepo, UserEntityRepository } from './user.entity.repo';

export interface IRepoProvider {
  getOrganizationEntityRepo(
    entityManager: EntityManager
  ): IOrganizationEntityRepo;

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
}
