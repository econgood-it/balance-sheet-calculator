import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { BalanceSheet } from './balanceSheet';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Column()
  public readonly shortName: string;

  @Column()
  public name: string;

  @Column('double precision')
  public estimations: number;

  @Column('double precision')
  public points: number = 0;

  @Column('double precision')
  public maxPoints: number = 0;

  @Column('double precision')
  public weight: number;

  @Column('boolean')
  public isWeightSelectedByUser: boolean;

  @Column('boolean')
  public isPositive: boolean;

  @ManyToOne((type) => BalanceSheet, (balanceSheet) => balanceSheet.ratings)
  public balanceSheet!: BalanceSheet;

  public constructor(
    id: number | undefined,
    shortName: string,
    name: string,
    estimations: number,
    points: number,
    maxPoints: number,
    weight: number,
    isWeightSelectedByUser: boolean,
    isPositive: boolean
  ) {
    this.id = id;
    this.shortName = shortName;
    this.name = name;
    this.estimations = estimations;
    this.points = points;
    this.maxPoints = maxPoints;
    this.weight = weight;
    this.isWeightSelectedByUser = isWeightSelectedByUser;
    this.isPositive = isPositive;
  }
}
