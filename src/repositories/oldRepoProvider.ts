import { EntityManager } from 'typeorm';
import {
  IOldOrganizationEntityRepo,
  OldOrganizationEntityRepository,
} from './oldOrganization.entity.repo';
import {
  BalanceSheetEntityRepository,
  IBalanceSheetEntityRepo,
} from './old.balance.sheet.entity.repo';
import {
  IWorkbookEntityRepo,
  WorkbookEntityRepo,
} from './workbook.entity.repo';
import { Configuration } from '../reader/configuration.reader';

export interface IOldRepoProvider {
  getOrganizationEntityRepo(
    entityManager: EntityManager
  ): IOldOrganizationEntityRepo;

  getBalanceSheetEntityRepo(
    entityManager: EntityManager
  ): IBalanceSheetEntityRepo;

  getWorkbookEntityRepo(): IWorkbookEntityRepo;
}

export class OldRepoProvider implements IOldRepoProvider {
  constructor(private configuration: Configuration) {}
  getOrganizationEntityRepo(
    entityManager: EntityManager
  ): IOldOrganizationEntityRepo {
    return new OldOrganizationEntityRepository(entityManager);
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
