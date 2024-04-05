import {
  AfterLoad,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { z } from 'zod';
import {
  OrganizationRequestSchema,
  OrganizationResponseSchema,
} from '@ecogood/e-calculator-schemas/dist/organization.dto';
import { BalanceSheetEntity } from './balance.sheet.entity';
import { ConflictError } from '../exceptions/conflict.error';
import { User } from '../models/user';
import { NoAccessError } from '../exceptions/no.access.error';
import { DatabaseValidationError } from '../exceptions/databaseValidationError';

type Member = {
  id: string;
};

const errorMsg = 'Must not be blank';
const isNonEmptyString = z
  .string({ required_error: errorMsg })
  .min(1, { message: errorMsg });

export const OrganizationDBSchema = z
  .object({
    name: isNonEmptyString,
    address: z.object({
      city: isNonEmptyString,
      houseNumber: isNonEmptyString,
      street: isNonEmptyString,
      zip: isNonEmptyString,
    }),
    invitations: z.string().email().array(),
  })
  .brand<'OrganizationDB'>();

export type OrganizationDB = z.infer<typeof OrganizationDBSchema>;

@Entity()
export class OrganizationEntity {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Column('jsonb')
  public organization: OrganizationDB;

  @Column('jsonb')
  public readonly members: Member[];

  @OneToMany(
    (type) => BalanceSheetEntity,
    (balanceSheetEntity) => balanceSheetEntity.organizationEntity
  )
  public balanceSheetEntities: BalanceSheetEntity[] | undefined;

  public constructor(
    id: number | undefined,
    organization: OrganizationDB,
    members: Member[]
  ) {
    this.id = id;
    this.organization = organization;
    this.members = members;
  }

  @AfterLoad()
  validateOrganization() {
    const result = OrganizationDBSchema.safeParse(this.organization);
    if (!result.success) {
      throw new DatabaseValidationError(
        result.error,
        'Column organization is not valid',
        this.id
      );
    }
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

  public join(user: User) {
    if (!this.organization.invitations.find((i) => i === user.email)) {
      throw new NoAccessError();
    }
    if (this.members.find((m) => m.id === user.id)) {
      throw new ConflictError('User is already member');
    }
    this.members.push({ id: user.id });
    this.organization.invitations = this.organization.invitations.filter(
      (i) => i !== user.email
    );
  }

  public mergeWithRequest(
    organizationRequest: z.infer<typeof OrganizationRequestSchema>
  ) {
    this.organization = OrganizationDBSchema.parse({
      ...organizationRequest,
      invitations: this.organization.invitations,
    });
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
