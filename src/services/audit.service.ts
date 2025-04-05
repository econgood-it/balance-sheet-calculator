import { NextFunction, Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { handle } from '../exceptions/error.handler';
import { IRepoProvider } from '../repositories/repo.provider';
import deepFreeze from 'deep-freeze';
import {
  AuditFullResponseBodySchema,
  AuditSubmitRequestBodySchema,
  AuditSubmitResponseBodySchema,
} from '@ecogood/e-calculator-schemas/dist/audit.dto';
import { makeAudit } from '../models/audit';
import {
  checkIfCurrentUserHasEditorPermissions,
  checkIfCurrentUserIsMemberOfCertificationAuthority,
} from '../security/authorization';
import { ConflictError } from '../exceptions/conflict.error';

export interface IAuditService {
  submitBalanceSheetToAudit(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;

  getAudit(req: Request, res: Response, next: NextFunction): Promise<void>;
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
          throw new ConflictError(
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
            certificationAuthority.organizationId
          )
        );
        res.json(
          AuditSubmitResponseBodySchema.parse({
            id: audit.id,
            submittedAt: audit.submittedAt?.toISOString(),
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
          })
        );
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  return deepFreeze({
    submitBalanceSheetToAudit,
    getAudit,
  });
}
