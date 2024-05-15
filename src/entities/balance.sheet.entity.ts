import {
  AfterLoad,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DatabaseValidationError } from '../exceptions/databaseValidationError';
import { OrganizationEntity } from './organization.entity';
import {
  BalanceSheetDB,
  BalanceSheetDBSchema,
} from './schemas/balance.sheet.schema';

@Entity()
export class BalanceSheetEntity {
  @PrimaryGeneratedColumn()
  public readonly id: number | undefined;

  @Column({
    type: 'jsonb',
  })
  public balanceSheet: BalanceSheetDB;

  @ManyToOne(
    () => OrganizationEntity,
    (organizationEntity) => organizationEntity.balanceSheetEntities
  )
  public readonly organizationEntity: OrganizationEntity | undefined;

  @Column()
  public organizationEntityId: number | undefined;

  // TODO: Add zod brand for balance sheet
  public constructor(id: number | undefined, balanceSheet: BalanceSheetDB) {
    this.id = id;
    this.balanceSheet = balanceSheet;
  }

  public get version() {
    return this.balanceSheet.version;
  }

  public get type() {
    return this.balanceSheet.type;
  }

  public get companyFacts() {
    return this.balanceSheet.companyFacts;
  }

  public get ratings() {
    return this.balanceSheet.ratings;
  }

  public get stakeholderWeights() {
    return this.balanceSheet.stakeholderWeights;
  }

  @AfterLoad()
  validateBalanceSheet() {
    const result = BalanceSheetDBSchema.strict().safeParse(this.balanceSheet);
    if (!result.success) {
      throw new DatabaseValidationError(
        result.error,
        'Column balanceSheet is not valid',
        this.id
      );
    }
  }
}
