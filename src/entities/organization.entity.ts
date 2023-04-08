import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Organization } from '../models/organization';
import { User } from './user';
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
}
