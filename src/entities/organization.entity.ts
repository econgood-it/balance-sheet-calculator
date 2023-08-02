import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Organization } from '../models/organization';
import { User } from './user';
import { z } from 'zod';
import { OrganizationResponseSchema } from '@ecogood/e-calculator-schemas/dist/organization.dto';
import { BalanceSheetEntity } from './balance.sheet.entity';
import { ConflictError } from '../exceptions/conflict.error';
export const ORGANIZATION_RELATIONS = ['members'];

@Entity()
export class OrganizationEntity {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Column('jsonb')
  public readonly organization: Organization;

  @ManyToMany((type) => User, (user) => user.organizationEntities)
  @JoinTable({ name: 'organization_members' })
  public readonly members: User[];

  @OneToMany(
    (type) => BalanceSheetEntity,
    (balanceSheetEntity) => balanceSheetEntity.organizationEntity
  )
  public balanceSheetEntities: BalanceSheetEntity[] | undefined;

  public constructor(
    id: number | undefined,
    organization: Organization,
    members: User[]
  ) {
    this.id = id;
    this.organization = organization;
    this.members = members;
  }

  public addBalanceSheetEntity(balanceSheetEntity: BalanceSheetEntity) {
    if (!z.number().safeParse(balanceSheetEntity.id).success) {
      throw new Error('Balance sheet has no Id');
    }
    if (
      this.balanceSheetEntities &&
      this.balanceSheetEntities.find((b) => b.id === balanceSheetEntity.id)
    ) {
      throw new ConflictError('Balance sheet already exists in organization');
    }
    this.balanceSheetEntities = this.balanceSheetEntities
      ? [...this.balanceSheetEntities, balanceSheetEntity]
      : [balanceSheetEntity];
  }

  public hasMemberWithEmail(userEmail: string) {
    return this.members.some((u) => u.email === userEmail);
  }

  public toJson(): z.infer<typeof OrganizationResponseSchema> {
    return OrganizationResponseSchema.parse({
      id: this.id,
      ...this.organization,
    });
  }
}
