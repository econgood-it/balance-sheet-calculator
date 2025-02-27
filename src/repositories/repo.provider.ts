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
import { IAuditRepo, makeAuditRepository } from './audit.repo';
import {
  ICertificationAuthorityRepo,
  makeCertificationAuthorityRepo,
} from './certification.authority.repo';

export interface IRepoProvider {
  getBalanceSheetRepo(entityManager: EntityManager): IBalanceSheetRepo;
  getOrganizationRepo(entityManager: EntityManager): IOrganizationRepo;
  getAuditRepo(entityManager: EntityManager): IAuditRepo;
  getCertificationAuthorityRepo(
    entityManager: EntityManager
  ): ICertificationAuthorityRepo;
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

  function getAuditRepo(entityManager: EntityManager): IAuditRepo {
    return makeAuditRepository(entityManager);
  }

  function getCertificationAuthorityRepo(
    entityManager: EntityManager
  ): ICertificationAuthorityRepo {
    return makeCertificationAuthorityRepo(entityManager);
  }

  return deepFreeze({
    getBalanceSheetRepo,
    getOrganizationRepo,
    getAuditRepo,
    getCertificationAuthorityRepo,
  });
}
