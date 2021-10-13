import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { BalanceSheetVersion } from './enums';

export const AVERAGE_COUNTRY_CODE_MAPPING = new Map([
  ['Average Ozeania', 'AOC'],
  ['World', 'AWO'],
  ['Average Ozeania', 'AOC'],
  ['Average Europe', 'AEU'],
  ['Average Asia', 'AAS'],
  ['Average America', 'AAM'],
  ['Average Africa', 'AAF'],
]);
export const DEFAULT_COUNTRY_CODE = 'DEFAULT_COUNTRY_CODE';

@Entity()
export class Region {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Column('double precision')
  public readonly pppIndex: number;

  @Index({ unique: true })
  @Column()
  public readonly countryCode: string;

  @Column()
  public readonly countryName: string;

  @Column('double precision')
  public readonly ituc: number;

  @Column('text')
  public readonly validFromVersion: BalanceSheetVersion;

  constructor(
    id: number | undefined,
    pppIndex: number,
    countryCode: string,
    countryName: string,
    ituc: number,
    validFromVersion: BalanceSheetVersion
  ) {
    this.id = id;
    this.pppIndex = pppIndex;
    this.countryCode = countryCode;
    this.countryName = countryName;
    this.ituc = ituc;
    this.validFromVersion = validFromVersion;
  }
}
