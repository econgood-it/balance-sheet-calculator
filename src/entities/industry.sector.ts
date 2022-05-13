import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { CompanyFacts } from './companyFacts';
import { Translations } from './Translations';

export const INDUSTRY_CODE_FOR_FINANCIAL_SERVICES = 'K';
export const INDUSTRY_CODE_FOR_MINING = 'B';
export const INDUSTRY_CODE_FOR_CONSTRUCTION_INDUSTRY = 'F';

@Entity()
export class IndustrySector {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Column()
  public industryCode: string;

  @Column('double precision')
  public amountOfTotalTurnover: number;

  @Column({
    type: 'jsonb',
  })
  public description: Translations;

  @ManyToOne(
    (type) => CompanyFacts,
    (companyFacts) => companyFacts.industrySectors
  )
  public companyFacts!: CompanyFacts;

  constructor(
    id: number | undefined,
    industryCode: string,
    amountOfTotalTurnover: number,
    description: Translations
  ) {
    this.id = id;
    this.industryCode = industryCode;
    this.amountOfTotalTurnover = amountOfTotalTurnover;
    this.description = description;
  }
}
