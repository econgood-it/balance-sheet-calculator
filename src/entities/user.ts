import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from './enums';
import { BalanceSheetEntity } from './balance.sheet.entity';
import { ApiKey } from './api.key';

export const USER_RELATIONS = ['apiKeys'];

@Entity()
export class User {
  private static readonly HASH_SALT_ROUNDS: number = 10;

  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Column()
  @Index({ unique: true })
  public readonly email: string;

  @Column()
  public password: string;

  @Column('text')
  public role: Role;

  @OneToMany((type) => ApiKey, (apiKey) => apiKey.user, { cascade: true })
  apiKeys!: ApiKey[];

  @ManyToMany(
    (type) => BalanceSheetEntity,
    (balanceSheetEntity) => balanceSheetEntity.users
  )
  balanceSheetEntities!: BalanceSheetEntity[];

  public constructor(
    id: number | undefined,
    email: string,
    password: string,
    role: Role
  ) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.role = role;
  }

  public getApiKeys(): ApiKey[] {
    return this.apiKeys;
  }

  public addApiKey() {
    if (!this.apiKeys) {
      this.apiKeys = [];
    }
    const apiKey = new ApiKey();
    this.apiKeys.push(apiKey);
  }

  public removeApiKey(apiKey: ApiKey) {
    this.apiKeys = this.apiKeys.filter((ak) => ak.id !== apiKey.id);
  }

  @BeforeInsert()
  @BeforeUpdate()
  hashPassword() {
    const salt = bcrypt.genSaltSync(User.HASH_SALT_ROUNDS);
    this.password = bcrypt.hashSync(this.password, salt);
  }

  public comparePassword(password: string): boolean {
    return bcrypt.compareSync(password, this.password);
  }
}
