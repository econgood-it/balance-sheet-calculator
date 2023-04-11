import { EntityManager } from 'typeorm';
import {
  IOrganizationEntityRepo,
  OrganizationEntityRepository,
} from './organization.entity.repo';

export interface IRepoProvider {
  getOrganizationEntityRepo(
    entityManager: EntityManager
  ): IOrganizationEntityRepo;
}

export class RepoProvider implements IRepoProvider {
  getOrganizationEntityRepo(
    entityManager: EntityManager
  ): IOrganizationEntityRepo {
    return new OrganizationEntityRepository(entityManager);
  }
}
