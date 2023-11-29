import { EntityManager } from 'typeorm';
import {
  IOrganizationEntityRepo,
  OrganizationEntityRepository,
} from './organization.entity.repo';
import {
  BalanceSheetEntityRepository,
  IBalanceSheetEntityRepo,
} from './balance.sheet.entity.repo';
import {
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

  getWorkbookEntityRepo(): IWorkbookEntityRepo;
}

export class RepoProvider implements IRepoProvider {
  constructor(private configuration: Configuration) {}
  getOrganizationEntityRepo(
    entityManager: EntityManager
  ): IOrganizationEntityRepo {
    return new OrganizationEntityRepository(entityManager);
  }

  getBalanceSheetEntityRepo(
    entityManager: EntityManager
  ): IBalanceSheetEntityRepo {
    return new BalanceSheetEntityRepository(entityManager);
  }

  getWorkbookEntityRepo(): IWorkbookEntityRepo {
    return new WorkbookEntityRepo(this.configuration.workbookApiToken);
  }
}
