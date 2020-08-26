import { PrimaryGeneratedColumn, Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Rating } from './rating';
import { PositiveAspect } from './positiveAspect';
import { NegativeAspect } from './negativeAspect';

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

    @OneToMany(type => PositiveAspect, aspect => aspect.topic, { cascade: true })
    public readonly positiveAspects: PositiveAspect[];

    @OneToMany(type => NegativeAspect, aspect => aspect.topic, { cascade: true })
    public readonly negativeAspects: NegativeAspect[];

    public constructor(
        id: number | undefined,
        shortName: string,
        name: string,
        estimations: number,
        points: number,
        maxPoints: number,
        weight: number,
        postiveAspects: PositiveAspect[],
        negativeAspects: NegativeAspect[]
    ) {
        this.id = id;
        this.shortName = shortName;
        this.name = name;
        this.estimations = estimations;
        this.points = points;
        this.maxPoints = maxPoints;
        this.weight = weight;
        this.positiveAspects = postiveAspects;
        this.negativeAspects = negativeAspects;
    }
}
