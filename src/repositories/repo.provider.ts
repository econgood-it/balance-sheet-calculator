import { EntityManager } from 'typeorm';
import { Configuration } from '../reader/configuration.reader';
import {
  IBalanceSheetRepo,
  makeBalanceSheetRepository,
} from './balance.sheet.repo';
import deepFreeze from 'deep-freeze';
import {
  IOrganizationRepo,
  makeOrganizationRepository,
} from './organization.repo';
import { IWorkbookRepo, makeWorkbookRepo } from './workbook.repo';

export interface IRepoProvider {
  getBalanceSheetRepo(entityManager: EntityManager): IBalanceSheetRepo;
  getOrganizationRepo(entityManager: EntityManager): IOrganizationRepo;
  getWorkbookRepo(): IWorkbookRepo;
}

export function makeRepoProvider(configuration: Configuration): IRepoProvider {
  function getBalanceSheetRepo(
    entityManager: EntityManager
  ): IBalanceSheetRepo {
    return makeBalanceSheetRepository(entityManager);
  }

  function getOrganizationRepo(
    entityManager: EntityManager
  ): IOrganizationRepo {
    return makeOrganizationRepository(entityManager);
  }

  function getWorkbookRepo(): IWorkbookRepo {
    return makeWorkbookRepo(configuration.workbookApiToken);
  }

  return deepFreeze({
    getBalanceSheetRepo,
    getOrganizationRepo,
    getWorkbookRepo,
  });
}
