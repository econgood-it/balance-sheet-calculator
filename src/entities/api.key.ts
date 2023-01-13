import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user';
import { v4 as uuid4 } from 'uuid';

@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date | undefined;

  @Column()
  public value!: string;

  @ManyToOne(() => User, (user) => user.apiKeys)
  public user!: User;

  @BeforeInsert()
  generateValue() {
    this.value = uuid4();
  }
}
