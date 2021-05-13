import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { CompanyFacts } from './companyFacts';

@Entity()
export class EmployeesFraction {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Column()
  public readonly countryCode: string;

  @Column('double precision')
  public readonly percentage: number;

  @ManyToOne(
    (type) => CompanyFacts,
    (companyFacts) => companyFacts.employeesFractions
  )
  public companyFacts!: CompanyFacts;

  public constructor(
    id: number | undefined,
    countryCode: string,
    percentage: number
  ) {
    this.id = id;
    this.countryCode = countryCode;
    this.percentage = percentage;
  }
}
