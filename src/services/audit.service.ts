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
import { checkIfCurrentUserHasEditorPermissions } from '../security/authorization';
import { z } from 'zod';
import NotFoundException from '../exceptions/not.found.exception';
import { ConflictException } from '../exceptions/conflict.exception';
import BadRequestException from '../exceptions/bad.request.exception';
import InternalServerException from '../exceptions/internal.server.exception';

export interface IAuditService {
  submitBalanceSheetToAudit(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;

  getAudit(req: Request, res: Response, next: NextFunction): Promise<void>;
  findAudit(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteAudit(req: Request, res: Response, next: NextFunction): Promise<void>;
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
    const { balanceSheetId, searchBy } = parseSearchQueryParameters(req);
    dataSource.manager
      .transaction(async (entityManager) => {
        const auditRepo = repoProvider.getAuditRepo(entityManager);
        const balanceSheetRepo =
          repoProvider.getBalanceSheetRepo(entityManager);

        const foundBalanceSheet = await balanceSheetRepo.findByIdOrFail(
          balanceSheetId
        );

        await checkIfCurrentUserHasEditorPermissions(
          req,
          repoProvider.getOrganizationRepo(entityManager),
          foundBalanceSheet
        );

        const audit =
          searchBy === 'submittedBalanceSheetId'
            ? await auditRepo.findBySubmittedBalanceSheetId(balanceSheetId)
            : await auditRepo.findByAuditCopyId(balanceSheetId);

        if (!audit) {
          throw new NotFoundException(
            `Could not find audit for balance sheet ${balanceSheetId}`
          );
        }

        res.json(
          AuditSearchResponseBodySchema.parse({
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

  async function deleteAudit(req: Request, res: Response, next: NextFunction) {
    dataSource.manager
      .transaction(async (entityManager) => {
        const auditRepo = repoProvider.getAuditRepo(entityManager);
        const foundAudit = await auditRepo.findByIdOrFail(
          Number(req.params.id)
        );
        if (!(await auditRepo.remove(foundAudit))) {
          throw new InternalServerException(
            `Deleting audit with id ${foundAudit.id} failed.`
          );
        }
        res.json({
          message: `Successfully deleted audit with id ${foundAudit.id}`,
        });
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  function parseSearchQueryParameters(req: Request) {
    const { submittedBalanceSheetId, auditCopyId } = req.query;

    if (submittedBalanceSheetId) {
      return {
        balanceSheetId: z
          .number()
          .min(0)
          .parse(Number(req.query.submittedBalanceSheetId)),
        searchBy: 'submittedBalanceSheetId',
      };
    } else if (auditCopyId) {
      return {
        balanceSheetId: z.number().min(0).parse(Number(req.query.auditCopyId)),
        searchBy: 'auditCopyId',
      };
    }
    throw new BadRequestException(
      'Missing search query parameter. Please provide one of: submittedBalanceSheetId, auditCopyId'
    );
  }

  return deepFreeze({
    submitBalanceSheetToAudit,
    findAudit,
    getAudit,
    deleteAudit,
  });
}
