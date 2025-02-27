import { NextFunction, Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { handle } from '../exceptions/error.handler';
import { parseLanguageParameter } from '../language/translations';
import { IRepoProvider } from '../repositories/repo.provider';
import deepFreeze from 'deep-freeze';
import { AuditSubmitRequestBodySchema } from '@ecogood/e-calculator-schemas/dist/audit.dto';
import { makeAudit } from '../models/audit';
import { CertificationAuthorityNames } from '../entities/certification.authority.entity';

export interface IAuditService {
  submitBalanceSheetToAudit(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
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
    const language = parseLanguageParameter(req.query.lng);
    dataSource.manager
      .transaction(async (entityManager) => {
        const auditRequest = AuditSubmitRequestBodySchema.parse(req.body);
        const balanceSheetRepository =
          repoProvider.getBalanceSheetRepo(entityManager);
        const certificationAuthorityRepo =
          repoProvider.getCertificationAuthorityRepo(entityManager);
        const auditRepo = repoProvider.getAuditRepo(entityManager);
        const balanceSheetToSubmit =
          await balanceSheetRepository.findByIdOrFail(
            auditRequest.balanceSheetToBeSubmitted
          );
        const certificationAuthority =
          await certificationAuthorityRepo.findByName(
            CertificationAuthorityNames.AUDIT
          );
        const audit = await auditRepo.save(
          makeAudit().submitBalanceSheet(
            balanceSheetToSubmit,
            certificationAuthority.organizationId
          )
        );
        res.json({ id: audit.id });
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  return deepFreeze({
    submitBalanceSheetToAudit,
  });
}
