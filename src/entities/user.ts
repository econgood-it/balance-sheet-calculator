import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  Index,
  BeforeUpdate,
  BeforeInsert,
  ManyToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from './enums';
import { BalanceSheet } from './balanceSheet';

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

  @ManyToMany((type) => BalanceSheet, (balanceSheet) => balanceSheet.users)
  balanceSheets!: BalanceSheet[];

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
