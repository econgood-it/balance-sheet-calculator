import { Topic } from './topic';
import { OneToMany, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @OneToMany((type) => Topic, (topic) => topic.rating, { cascade: true })
  public readonly topics: Topic[];

  public constructor(id: number | undefined, topics: Topic[]) {
    this.topics = topics;
  }
}
