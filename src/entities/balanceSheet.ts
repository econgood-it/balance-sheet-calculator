import { Rating } from './rating';
import { CompanyFacts } from './companyFacts';
import { PrimaryGeneratedColumn, Entity, OneToOne, JoinColumn, Column } from 'typeorm';
import { BalanceSheetType, BalanceSheetVersion } from './enums';


@Entity()
export class BalanceSheet {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;
  @Column('text')
  public readonly type: BalanceSheetType;
  @Column('text')
  public readonly version: BalanceSheetVersion;
  @OneToOne(type => CompanyFacts, { cascade: true })
  @JoinColumn()
  public readonly companyFacts: CompanyFacts;
  @OneToOne(type => Rating, { cascade: true })
  @JoinColumn()
  public readonly rating: Rating;
  public constructor(
    id: number | undefined,
    type: BalanceSheetType,
    version: BalanceSheetVersion,
    companyFacts: CompanyFacts,
    rating: Rating,
  ) {
    this.id = id;
    this.type = type;
    this.version = version;
    this.companyFacts = companyFacts;
    this.rating = rating;
  }
}

