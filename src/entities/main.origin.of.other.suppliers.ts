import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity()
export class MainOriginOfOtherSuppliers {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Column()
  public countryCode: string;

  @Column('double precision')
  public costs: number;

  constructor(id: number | undefined, countryCode: string, costs: number) {
    this.id = id;
    this.countryCode = countryCode;
    this.costs = costs;
  }
}
