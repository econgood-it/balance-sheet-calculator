import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user';
import { BalanceSheet } from '../models/balance.sheet';
import { CompanyFacts } from '../models/company.facts';
import { Rating } from '../models/rating';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';

export const BALANCE_SHEET_RELATIONS = ['users'];

@Entity()
export class BalanceSheetEntity {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Column({
    type: 'jsonb',
  })
  public balanceSheet: BalanceSheet;

  @ManyToMany((type) => User, (user) => user.balanceSheetEntities)
  @JoinTable({ name: 'balance_sheet_entities_users' })
  public readonly users: User[];

  public constructor(
    id: number | undefined,
    balanceSheet: BalanceSheet,
    users: User[]
  ) {
    this.id = id;
    this.balanceSheet = balanceSheet;
    this.users = users;
  }

  public userWithEmailHasAccess(userEmail: string) {
    return this.users.some((u) => u.email === userEmail);
  }

  public getVersion(): BalanceSheetVersion {
    return this.balanceSheet.version;
  }
  public getType(): BalanceSheetType {
    return this.balanceSheet.type;
  }

  public toBalanceSheet(): BalanceSheet {
    return this.balanceSheet;
  }
}
