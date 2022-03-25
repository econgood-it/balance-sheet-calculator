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
  OneToMany,
} from 'typeorm';
import { BalanceSheetType, BalanceSheetVersion } from './enums';
import { User } from './user';

export const BALANCE_SHEET_RELATIONS = [
  'companyFacts',
  'companyFacts.supplyFractions',
  'companyFacts.employeesFractions',
  'companyFacts.industrySectors',
  'companyFacts.mainOriginOfOtherSuppliers',
  'ratings',
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

  @OneToMany((type) => Rating, (rating) => rating.balanceSheet, {
    cascade: true,
  })
  public readonly ratings: Rating[];

  @ManyToMany((type) => User, (user) => user.balanceSheets)
  @JoinTable({ name: 'balance_sheets_users' })
  public readonly users: User[];

  public constructor(
    id: number | undefined,
    type: BalanceSheetType,
    version: BalanceSheetVersion,
    companyFacts: CompanyFacts,
    ratings: Rating[],
    users: User[]
  ) {
    this.id = id;
    this.type = type;
    this.version = version;
    this.companyFacts = companyFacts;
    this.ratings = ratings;
    this.users = users;
  }

  public getTopics(): Rating[] {
    return this.ratings.filter((rating) => rating.isTopic());
  }

  public getAspectsOfTopic(shortNameTopic: string): Rating[] {
    return this.ratings.filter((rating) =>
      rating.isAspectOfTopic(shortNameTopic)
    );
  }

  public sortRatings(): void {
    this.ratings.sort((r1, r2) => r1.shortName.localeCompare(r2.shortName));
  }
}
