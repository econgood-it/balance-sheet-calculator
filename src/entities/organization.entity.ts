import {
  AfterLoad,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BalanceSheetEntity } from './balance.sheet.entity';
import { DatabaseValidationError } from '../exceptions/databaseValidationError';
import {
  OrganizationDB,
  OrganizationDBSchema,
} from './schemas/organization.schema';

type Member = {
  id: string;
};

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
}
