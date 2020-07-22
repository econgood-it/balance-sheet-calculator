import { Rating } from './rating';
import { CompanyFacts } from './companyFacts';
import { PrimaryGeneratedColumn, Entity, OneToOne, JoinColumn } from 'typeorm';
import { strictObjectMapper, expectNumber } from '@daniel-faber/json-ts';
import { BalanceSheetDTOUpdate } from '../dto/update/balanceSheetUpdate.dto';

@Entity()
export class BalanceSheet {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;
  @OneToOne(type => CompanyFacts, { cascade: true })
  @JoinColumn()
  public readonly companyFacts: CompanyFacts;
  @OneToOne(type => Rating, { cascade: true })
  @JoinColumn()
  public readonly rating: Rating;
  public constructor(
    id: number | undefined,
    companyFacts: CompanyFacts,
    rating: Rating,
  ) {
    this.id = id;
    this.companyFacts = companyFacts;
    this.rating = rating;
  }
}

