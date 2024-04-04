import { EntityManager } from 'typeorm';
import { Configuration } from '../reader/configuration.reader';
import {
  IBalanceSheetRepo,
  makeBalanceSheetRepository,
} from './balance.sheet.repo';
import deepFreeze from 'deep-freeze';

export interface IRepoProvider {
  getBalanceSheetRepo(entityManager: EntityManager): IBalanceSheetRepo;
}

export function makeRepoProvider(configuration: Configuration): IRepoProvider {
  function getBalanceSheetRepo(
    entityManager: EntityManager
  ): IBalanceSheetRepo {
    return makeBalanceSheetRepository(entityManager);
  }

  return deepFreeze({
    getBalanceSheetRepo,
  });
}
