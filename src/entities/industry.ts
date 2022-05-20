import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
export class Industry {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Index({ unique: true })
  @Column()
  public readonly industryCode: string;

  @Column()
  public readonly name: string;

  @Column('double precision')
  public readonly ecologicalSupplyChainRisk: number;

  @Column('double precision')
  public readonly ecologicalDesignOfProductsAndServices: number;

  constructor(
    id: number | undefined,
    industryCode: string,
    name: string,
    ecologicalSupplyChainRisk: number,
    ecologicalDesignOfProductsAndServices: number
  ) {
    this.id = id;
    this.ecologicalSupplyChainRisk = ecologicalSupplyChainRisk;
    this.ecologicalDesignOfProductsAndServices =
      ecologicalDesignOfProductsAndServices;
    this.industryCode = industryCode;
    this.name = name;
  }
}
