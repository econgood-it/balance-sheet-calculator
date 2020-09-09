import { strictObjectMapper, expectString, expectNumber, arrayMapper } from '@daniel-faber/json-ts';
import { Topic } from './topic';
import { OneToMany, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;
  @OneToMany(type => Topic, topic => topic.rating, { cascade: true })
  public readonly topics: Topic[];

  public constructor(
    id: number | undefined,
    topics: Topic[]
  ) {

    this.topics = topics;
  }

  public updateTopic(shortName: string, estimations?: number, weight?: number, points?: number, maxPoints?: number) {
    const topic: Topic | undefined = this.topics.find(t => t.shortName == shortName);
    if (topic) {
      topic.estimations = estimations ? estimations : topic.estimations;
      topic.weight = weight ? weight : topic.weight;
      topic.points = points ? points : topic.points;
      topic.maxPoints = maxPoints ? maxPoints : topic.maxPoints;
    }
  }

}
