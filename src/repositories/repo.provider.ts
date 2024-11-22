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

export interface IRepoProvider {
  getBalanceSheetRepo(entityManager: EntityManager): IBalanceSheetRepo;
  getOrganizationRepo(entityManager: EntityManager): IOrganizationRepo;
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

  return deepFreeze({
    getBalanceSheetRepo,
    getOrganizationRepo,
  });
}
