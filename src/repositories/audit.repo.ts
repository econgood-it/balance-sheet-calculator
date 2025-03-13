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
    if (audit.balanceSheetToCopy) {
      const orginalCopy = await balanceSheetRepo.save(audit.balanceSheetToCopy);
      const auditCopy = await balanceSheetRepo.save(audit.balanceSheetToCopy);

      return convertToAudit(
        await repo.save(
          await convertToAuditEntity(
            audit.assignAuditCopies(orginalCopy, auditCopy)
          )
        )
      );
    }
    return convertToAudit(await repo.save(await convertToAuditEntity(audit)));
  }

  async function convertToAudit(auditEntity: AuditEntity): Promise<Audit> {
    return makeAudit({
      id: auditEntity.id,
      submittedBalanceSheetId: auditEntity.submittedBalanceSheetId,
      originalCopyId: auditEntity.originalCopyId,
      auditCopyId: auditEntity.auditCopyId,
      balanceSheetToCopy: undefined,
    });
  }

  async function convertToAuditEntity(audit: Audit): Promise<AuditEntity> {
    return new AuditEntity(
      audit.id,
      audit.submittedBalanceSheetId!,
      audit.auditCopyId!,
      audit.originalCopyId!
    );
  }

  return deepFreeze({
    findByIdOrFail,
    save,
  });
}
