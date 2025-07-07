import { NextFunction, Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { handle } from '../exceptions/error.handler';
import { IRepoProvider } from '../repositories/repo.provider';
import deepFreeze from 'deep-freeze';
import {
  AuditFullResponseBodySchema,
  AuditSearchResponseBodySchema,
  AuditSubmitRequestBodySchema,
  AuditSubmitResponseBodySchema,
} from '@ecogood/e-calculator-schemas/dist/audit.dto';
import { makeAudit } from '../models/audit';
import {
  checkIfCurrentUserHasEditorPermissions,
  checkIfCurrentUserIsMemberOfCertificationAuthority,
} from '../security/authorization';
import { z } from 'zod';
import NotFoundException from '../exceptions/not.found.exception';
import { ConflictException } from '../exceptions/conflict.exception';

export interface IAuditService {
  submitBalanceSheetToAudit(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;

  getAudit(req: Request, res: Response, next: NextFunction): Promise<void>;
  findAudit(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export function makeAuditService(
  dataSource: DataSource,
  repoProvider: IRepoProvider
): IAuditService {
  async function submitBalanceSheetToAudit(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    dataSource.manager
      .transaction(async (entityManager) => {
        const auditRequest = AuditSubmitRequestBodySchema.parse(req.body);
        const auditRepo = repoProvider.getAuditRepo(entityManager);
        if (
          await auditRepo.findBySubmittedBalanceSheetId(
            auditRequest.balanceSheetToBeSubmitted
          )
        ) {
          throw new ConflictException(
            `The balance sheet with id ${auditRequest.balanceSheetToBeSubmitted} has been already submitted to an audit`
          );
        }
        const balanceSheetRepository =
          repoProvider.getBalanceSheetRepo(entityManager);
        const certificationAuthorityRepo =
          repoProvider.getCertificationAuthorityRepo(entityManager);

        const balanceSheetToSubmit =
          await balanceSheetRepository.findByIdOrFail(
            auditRequest.balanceSheetToBeSubmitted
          );
        await checkIfCurrentUserHasEditorPermissions(
          req,
          repoProvider.getOrganizationRepo(entityManager),
          balanceSheetToSubmit
        );
        const certificationAuthority =
          await certificationAuthorityRepo.findByName(
            auditRequest.certificationAuthority
          );
        const audit = await auditRepo.save(
          makeAudit().submitBalanceSheet(
            balanceSheetToSubmit,
            certificationAuthority
          )
        );
        res.json(
          AuditSubmitResponseBodySchema.parse({
            id: audit.id,
            submittedAt: audit.submittedAt?.toISOString(),
            certificationAuthority: audit.certificationAuthorityName,
          })
        );
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  async function getAudit(req: Request, res: Response, next: NextFunction) {
    dataSource.manager
      .transaction(async (entityManager) => {
        const auditRepo = repoProvider.getAuditRepo(entityManager);
        const audit = await auditRepo.findByIdOrFail(Number(req.params.id));
        const certificationAuthorityRepo =
          repoProvider.getCertificationAuthorityRepo(entityManager);
        const orgaRepo = repoProvider.getOrganizationRepo(entityManager);
        await checkIfCurrentUserIsMemberOfCertificationAuthority(
          req,
          certificationAuthorityRepo,
          orgaRepo
        );

        res.json(
          AuditFullResponseBodySchema.parse({
            id: audit.id,
            auditCopyId: audit.auditCopyId,
            originalCopyId: audit.originalCopyId,
            submittedBalanceSheetId: audit.submittedBalanceSheetId,
            submittedAt: audit.submittedAt?.toISOString(),
            certificationAuthority: audit.certificationAuthorityName,
          })
        );
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  async function findAudit(req: Request, res: Response, next: NextFunction) {
    let submittedBalanceSheetId: number;
    try {
      submittedBalanceSheetId = z
        .number()
        .min(0)
        .parse(Number(req.query.submittedBalanceSheetId));
    } catch (error: any) {
      handle(error, next);
    }

    dataSource.manager
      .transaction(async (entityManager) => {
        const auditRepo = repoProvider.getAuditRepo(entityManager);
        const balanceSheetRepo =
          repoProvider.getBalanceSheetRepo(entityManager);

        const foundBalanceSheet = await balanceSheetRepo.findByIdOrFail(
          submittedBalanceSheetId
        );

        await checkIfCurrentUserHasEditorPermissions(
          req,
          repoProvider.getOrganizationRepo(entityManager),
          foundBalanceSheet
        );

        const audit = req.query.requestForAuditor !== undefined && req.query.requestForAuditor ? await auditRepo.findBySubmittedAuditId( submittedBalanceSheetId ) : await auditRepo.findBySubmittedBalanceSheetId( submittedBalanceSheetId );
        
        if (!audit) {
          throw new NotFoundException(
            `Could not find audit for balance sheet ${submittedBalanceSheetId}`
          );
        }

        res.json(
          AuditSearchResponseBodySchema.parse({
            id: audit.id,
            submittedBalanceSheetId: audit.submittedBalanceSheetId,
            submittedAt: audit.submittedAt?.toISOString(),
            certificationAuthority: audit.certificationAuthorityName,
          })
        );
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  return deepFreeze({
    submitBalanceSheetToAudit,
    findAudit,
    getAudit,
  });
}
