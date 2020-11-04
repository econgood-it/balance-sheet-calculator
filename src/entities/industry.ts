
import {Entity, Column, PrimaryGeneratedColumn, Index} from "typeorm";

@Entity()
export class Industry {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;
  @Column("double precision")
  public readonly ecologicalSupplyChainRisk: number;
  @Index({ unique: true })
  @Column()
  public readonly industryCode: string;

  constructor(id: number | undefined, ecologicalSupplyChainRisk: number, industryCode: string) {
    this.id = id;
    this.ecologicalSupplyChainRisk = ecologicalSupplyChainRisk;
    this.industryCode = industryCode;
  }

}
