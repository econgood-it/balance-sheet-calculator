import {PrimaryGeneratedColumn, Column, Entity, ManyToOne} from 'typeorm';
import {CompanyFacts} from "./companyFacts";

@Entity()
export class IndustrySector {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;
  @Column()
  public industryCode: string;
  @Column("double precision")
  public amountOfTotalTurnover: number;
  @Column()
  public description: string;
  @ManyToOne(type => CompanyFacts, companyFacts => companyFacts.industrySectors)
  public companyFacts!: CompanyFacts;

  constructor(id: number | undefined, industryCode: string, amountOfTotalTurnover: number, description: string) {
    this.id = id;
    this.industryCode = industryCode;
    this.amountOfTotalTurnover = amountOfTotalTurnover;
    this.description = description;
  }

}
