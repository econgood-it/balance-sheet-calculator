import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user';
import {
  BalanceSheet,
  BalanceSheetType,
  BalanceSheetVersion,
  CompanyFacts,
  Rating,
} from '../models/balance.sheet';

export const BALANCE_SHEET_RELATIONS = ['users'];

@Entity()
export class BalanceSheetEntity {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Column('text')
  public readonly type: BalanceSheetType;

  @Column('text')
  public readonly version: BalanceSheetVersion;

  @Column({
    type: 'jsonb',
  })
  public companyFacts: CompanyFacts;

  @Column({
    type: 'jsonb',
  })
  public ratings: Rating[];

  @ManyToMany((type) => User, (user) => user.balanceSheetEntities)
  @JoinTable({ name: 'balance_sheet_entities_users' })
  public readonly users: User[];

  public constructor(
    id: number | undefined,
    type: BalanceSheetType,
    version: BalanceSheetVersion,
    ratings: Rating[],
    companyFacts: CompanyFacts,
    users: User[]
  ) {
    this.id = id;
    this.type = type;
    this.version = version;
    this.ratings = ratings;
    this.companyFacts = companyFacts;
    this.users = users;
  }

  public toBalanceSheet(): BalanceSheet {
    return {
      type: this.type,
      version: this.version,
      ratings: this.ratings,
      companyFacts: this.companyFacts,
    };
  }
}

export function createFromBalanceSheet(
  balanceSheet: BalanceSheet,
  users: User[]
): BalanceSheetEntity {
  return new BalanceSheetEntity(
    undefined,
    balanceSheet.type,
    balanceSheet.version,
    balanceSheet.ratings,
    balanceSheet.companyFacts,
    users
  );
}
