import { strictObjectMapper, expectString, expectNumber, arrayMapper, expectInteger } from '@daniel-faber/json-ts';
import { Topic } from './topic';
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Region {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @Column("double precision")
  public readonly pppIndex: number;
  @Column()
  public readonly countryCode: string;
  @Column()
  public readonly countryName: string;
  public constructor(pppIndex: number, countryCode: string, countryName: string) {
    this.pppIndex = pppIndex;
    this.countryCode = countryCode;
    this.countryName = countryName;
  }

  public static readonly fromJSON = strictObjectMapper(
    accessor =>
      new Region(
        accessor.get('pppIndex', expectNumber),
        accessor.get('countryCode', expectString),
        accessor.get('countryName', expectString)
      )
  );
}
