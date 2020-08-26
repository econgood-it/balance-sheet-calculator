import { Rating } from './rating';
import { CompanyFacts } from './companyFacts';
import { PrimaryGeneratedColumn, Entity, OneToOne, JoinColumn, Column } from 'typeorm';
import { BalanceSheetType } from './enums';


@Entity()
export class BalanceSheet {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;
  @Column('text')
  public readonly type: BalanceSheetType;
  @OneToOne(type => CompanyFacts, { cascade: true })
  @JoinColumn()
  public readonly companyFacts: CompanyFacts;
  @OneToOne(type => Rating, { cascade: true })
  @JoinColumn()
  public readonly rating: Rating;
  public constructor(
    id: number | undefined,
    type: BalanceSheetType,
    companyFacts: CompanyFacts,
    rating: Rating,
  ) {
    this.id = id;
    this.type = type;
    this.companyFacts = companyFacts;
    this.rating = rating;
  }
}

