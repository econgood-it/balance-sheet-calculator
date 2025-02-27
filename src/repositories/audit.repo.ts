import { EntityManager } from 'typeorm';
import deepFreeze from 'deep-freeze';
import { Audit, makeAudit } from '../models/audit';
import { AuditEntity } from '../entities/audit.entity';
import { makeBalanceSheetRepository } from './balance.sheet.repo';

export interface IAuditRepo {
  findByIdOrFail(id: number): Promise<Audit>;
  save(audit: Audit): Promise<Audit>;
}

export function makeAuditRepository(manager: EntityManager): IAuditRepo {
  const repo = manager.getRepository(AuditEntity);
  const balanceSheetRepo = makeBalanceSheetRepository(manager);

  async function findByIdOrFail(id: number): Promise<Audit> {
    return convertToAudit(
      await repo.findOneOrFail({
        where: { id },
      })
    );
  }
  async function save(audit: Audit): Promise<Audit> {
    return convertToAudit(await repo.save(await convertToAuditEntity(audit)));
  }

  async function convertToAudit(auditEntity: AuditEntity): Promise<Audit> {
    const balanceSheetCopy = await balanceSheetRepo.findByIdOrFail(
      auditEntity.balanceSheetCopyId
    );
    return makeAudit({
      id: auditEntity.id,
      submittedBalanceSheetId: auditEntity.submittedBalanceSheetId,
      balanceSheetCopy,
    });
  }

  async function convertToAuditEntity(audit: Audit): Promise<AuditEntity> {
    const foundBalanceSheet = await balanceSheetRepo.findByIdOrFail(
      audit.submittedBalanceSheetId!
    );
    const copiedBalanceSheet = await balanceSheetRepo.save(
      audit.balanceSheetCopy!
    );
    return new AuditEntity(
      audit.id,
      foundBalanceSheet.id!,
      copiedBalanceSheet.id!
    );
  }

  return deepFreeze({
    findByIdOrFail,
    save,
  });
}
