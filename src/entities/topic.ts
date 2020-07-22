import { strictObjectMapper, expectString, expectNumber } from '@daniel-faber/json-ts';
import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { Rating } from './rating';

@Entity()
export class Topic {
    @PrimaryGeneratedColumn()
    public readonly id: number | undefined;
    @Column()
    public readonly shortName: string;
    @Column()
    public readonly name: string;
    @Column("double precision")
    public estimations: number;
    @Column("double precision")
    public points: number = 0;
    @Column("double precision")
    public maxPoints: number = 0;
    @Column("double precision")
    public weight: number;

    @ManyToOne(type => Rating, rating => rating.topics)
    public rating!: Rating;

    public constructor(
        id: number | undefined,
        shortName: string,
        name: string,
        estimations: number,
        weight: number,
    ) {
        this.id = id;
        this.shortName = shortName;
        this.name = name;
        this.estimations = estimations;
        this.weight = weight;
    }
}
