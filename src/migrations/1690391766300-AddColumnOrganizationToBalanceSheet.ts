import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnOrganizationToBalanceSheet1690391766300
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "balance_sheet_entity" ADD COLUMN "organizationEntityId" integer`
    );
    const constraintQuery = `ALTER TABLE "balance_sheet_entity" ADD CONSTRAINT "FK_balance_sheet_organization" FOREIGN KEY ("organizationEntityId") REFERENCES "organization_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`;
    await queryRunner.query(constraintQuery);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "balance_sheet_entity" DROP CONSTRAINT "FK_balance_sheet_organization"`
    );

    const query = `ALTER TABLE "balance_sheet_entity" DROP COLUMN "organizationEntityId"`;
    await queryRunner.query(query);
  }
}
