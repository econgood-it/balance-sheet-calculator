import { strictObjectMapper, expectString, expectNumber } from '@daniel-faber/json-ts';
import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { CompanyFacts } from './companyFacts';

@Entity()
export class SupplyFraction {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;
  @Column()
  public countryCode: string;
  @Column("double precision")
  public costs: number;

  @ManyToOne(type => CompanyFacts, companyFacts => companyFacts.supplyFractions)
  public companyFacts!: CompanyFacts;

  constructor(id: number | undefined, countryCode: string, costs: number) {
    this.id = id;
    this.countryCode = countryCode;
    this.costs = costs;
  }

}
