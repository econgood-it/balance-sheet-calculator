
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Region {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;
  @Column("double precision")
  public readonly pppIndex: number;
  @Column()
  public readonly countryCode: string;
  @Column()
  public readonly countryName: string;

  constructor(id: number | undefined, pppIndex: number, countryCode: string, countryName: string) {
    this.id = id;
    this.pppIndex = pppIndex;
    this.countryCode = countryCode;
    this.countryName = countryName;
  }

}
