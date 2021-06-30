import { Topic } from './topic';
import { OneToMany, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Aspect } from './aspect';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @OneToMany((type) => Topic, (topic) => topic.rating, { cascade: true })
  public readonly topics: Topic[];

  public constructor(id: number | undefined, topics: Topic[]) {
    this.topics = topics;
  }

  public findAspect(shortName: string): Aspect | undefined {
    const topic = this.findTopic(shortName.substring(0, 2));
    return topic
      ? topic.aspects.find((a) => a.shortName === shortName)
      : undefined;
  }

  public findTopic(shortName: string): Topic | undefined {
    return this.topics.find((t: Topic) => t.shortName === shortName);
  }
}
