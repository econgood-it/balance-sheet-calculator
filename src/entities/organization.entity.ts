import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Organization } from '../models/organization';
import { User } from './user';
import { z } from 'zod';
import { OrganizationResponseSchema } from '@ecogood/e-calculator-schemas/dist/organization.dto';
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

  public constructor(
    id: number | undefined,
    organization: Organization,
    members: User[]
  ) {
    this.id = id;
    this.organization = organization;
    this.members = members;
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
