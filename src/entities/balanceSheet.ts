import { Rating } from './rating';
import { CompanyFacts } from './companyFacts';
import {
  PrimaryGeneratedColumn,
  Entity,
  OneToOne,
  JoinColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { BalanceSheetType, BalanceSheetVersion } from './enums';
import { User } from './user';

export const BALANCE_SHEET_RELATIONS = [
  'rating',
  'companyFacts',
  'companyFacts.supplyFractions',
  'companyFacts.employeesFractions',
  'companyFacts.industrySectors',
  'companyFacts.mainOriginOfOtherSuppliers',
  'rating.topics',
  'rating.topics.aspects',
  'users',
];

@Entity()
export class BalanceSheet {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Column('text')
  public readonly type: BalanceSheetType;

  @Column('text')
  public readonly version: BalanceSheetVersion;

  @OneToOne((type) => CompanyFacts, { cascade: true })
  @JoinColumn()
  public readonly companyFacts: CompanyFacts;

  @OneToOne((type) => Rating, { cascade: true })
  @JoinColumn()
  public readonly rating: Rating;

  @ManyToMany((type) => User, (user) => user.balanceSheets)
  @JoinTable({ name: 'balance_sheets_users' })
  public readonly users: User[];

  public constructor(
    id: number | undefined,
    type: BalanceSheetType,
    version: BalanceSheetVersion,
    companyFacts: CompanyFacts,
    rating: Rating,
    users: User[]
  ) {
    this.id = id;
    this.type = type;
    this.version = version;
    this.companyFacts = companyFacts;
    this.rating = rating;
    this.users = users;
  }
}
