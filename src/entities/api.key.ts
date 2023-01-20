import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user';
import * as bcrypt from 'bcrypt';
import { v4 as uuid4 } from 'uuid';

export const API_KEY_RELATIONS = ['user'];

@Entity()
export class ApiKey {
  private static readonly HASH_SALT_ROUNDS: number = 10;
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @CreateDateColumn({ name: 'created_at' })
  public created_at: Date | undefined;

  @Column()
  public value: string;

  @OneToOne(() => User, { cascade: false })
  @JoinColumn()
  public user: User;

  public constructor(
    id: number | undefined,
    value: string | undefined,
    user: User
  ) {
    this.id = id;
    this.value = value || uuid4();
    this.user = user;
  }

  @BeforeInsert()
  generateValue() {
    const salt = bcrypt.genSaltSync(ApiKey.HASH_SALT_ROUNDS);
    this.value = bcrypt.hashSync(this.value, salt);
  }

  public compareValue(value: string): boolean {
    return bcrypt.compareSync(value, this.value);
  }
}
