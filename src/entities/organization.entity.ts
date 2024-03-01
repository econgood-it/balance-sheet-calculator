import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Organization } from '../models/organization';

import { z } from 'zod';
import {
  OrganizationRequestSchema,
  OrganizationResponseSchema,
} from '@ecogood/e-calculator-schemas/dist/organization.dto';
import { BalanceSheetEntity } from './balance.sheet.entity';
import { ConflictError } from '../exceptions/conflict.error';

type Member = {
  id: string;
};

@Entity()
export class OrganizationEntity {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Column('jsonb')
  public organization: Organization;

  @Column('jsonb')
  public readonly members: Member[];

  @OneToMany(
    (type) => BalanceSheetEntity,
    (balanceSheetEntity) => balanceSheetEntity.organizationEntity
  )
  public balanceSheetEntities: BalanceSheetEntity[] | undefined;

  public constructor(
    id: number | undefined,
    organization: Organization,
    members: Member[]
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

  public invite(email: string) {
    if (!this.organization.invitations.find((i) => i === email)) {
      this.organization.invitations = [...this.organization.invitations, email];
    }
  }

  public mergeWithRequest(
    organizationRequest: z.infer<typeof OrganizationRequestSchema>
  ) {
    this.organization = {
      ...organizationRequest,
      invitations: this.organization.invitations,
    };
  }

  public hasMember(member: Member) {
    return this.members.some((m) => m.id === member.id);
  }

  public toJson(): z.infer<typeof OrganizationResponseSchema> {
    return OrganizationResponseSchema.parse({
      id: this.id,
      ...this.organization,
    });
  }
}
