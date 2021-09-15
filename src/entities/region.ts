import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

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

  constructor(
    id: number | undefined,
    pppIndex: number,
    countryCode: string,
    countryName: string,
    ituc: number
  ) {
    this.id = id;
    this.pppIndex = pppIndex;
    this.countryCode = countryCode;
    this.countryName = countryName;
    this.ituc = ituc;
  }
}
