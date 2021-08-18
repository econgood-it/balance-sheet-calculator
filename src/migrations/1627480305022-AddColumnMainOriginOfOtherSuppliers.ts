import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnMainOriginOfOtherSuppliers1627480305022
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const query = `ALTER TABLE "company_facts" ADD "mainOriginOfOtherSuppliersId" integer`;

    await queryRunner.query(query);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const query = `ALTER TABLE "company_facts" DROP COLUMN "mainOriginOfOtherSuppliersId"`;
    await queryRunner.query(query);
  }
}
