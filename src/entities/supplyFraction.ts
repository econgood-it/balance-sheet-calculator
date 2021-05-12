import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { CompanyFacts } from './companyFacts';

@Entity()
export class SupplyFraction {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Column()
  public countryCode: string;

  @Column()
  public industryCode: string;

  @Column('double precision')
  public costs: number;

  @ManyToOne(
    (type) => CompanyFacts,
    (companyFacts) => companyFacts.supplyFractions
  )
  public companyFacts!: CompanyFacts;

  constructor(
    id: number | undefined,
    industryCode: string,
    countryCode: string,
    costs: number
  ) {
    this.id = id;
    this.industryCode = industryCode;
    this.countryCode = countryCode;
    this.costs = costs;
  }
}
