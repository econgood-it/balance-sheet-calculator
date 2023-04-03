import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Organization } from '../models/organization';

@Entity()
export class OrganizationEntity {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Column('jsonb')
  public readonly organization: Organization;

  public constructor(id: number | undefined, organization: Organization) {
    this.id = id;
    this.organization = organization;
  }
}
