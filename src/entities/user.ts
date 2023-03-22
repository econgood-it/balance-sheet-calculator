import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from './enums';
import { BalanceSheetEntity } from './balance.sheet.entity';
import {
  PasswordResetRequestBodySchema,
  UserRequestBodySchema,
} from 'e-calculator-schemas/dist/user.schema';
import { z } from 'zod';

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

export function parseAsUser(json: z.infer<typeof UserRequestBodySchema>): User {
  return UserRequestBodySchema.transform(
    (u) => new User(undefined, u.email, u.password, Role.User)
  ).parse(json);
}
