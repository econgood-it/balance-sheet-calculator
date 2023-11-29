import { EntityManager, Repository } from 'typeorm';
import {
  BALANCE_SHEET_RELATIONS,
  BalanceSheetEntity,
} from '../entities/balance.sheet.entity';

export interface IBalanceSheetEntityRepo {
  findByIdOrFail(id: number): Promise<BalanceSheetEntity>;
  save(balanceSheetEntity: BalanceSheetEntity): Promise<BalanceSheetEntity>;
  remove(balanceSheetEntity: BalanceSheetEntity): Promise<BalanceSheetEntity>;
}

export class BalanceSheetEntityRepository implements IBalanceSheetEntityRepo {
  private repo: Repository<BalanceSheetEntity>;

  constructor(manager: EntityManager) {
    this.repo = manager.getRepository(BalanceSheetEntity);
  }

  findByIdOrFail(id: number): Promise<BalanceSheetEntity> {
    return this.repo.findOneOrFail({
      where: { id },
      relations: BALANCE_SHEET_RELATIONS,
    });
  }

  save(balanceSheetEntity: BalanceSheetEntity): Promise<BalanceSheetEntity> {
    return this.repo.save(balanceSheetEntity);
  }

  remove(balanceSheetEntity: BalanceSheetEntity): Promise<BalanceSheetEntity> {
    return this.repo.remove(balanceSheetEntity);
  }
}
