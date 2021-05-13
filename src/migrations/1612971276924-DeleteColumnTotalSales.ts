import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteColumnTotalSales1612971276924 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const query = 'ALTER TABLE "company_facts" DROP COLUMN "totalSales"';
    await queryRunner.query(query);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const query = 'ALTER TABLE "company_facts" ADD COLUMN "totalSales"';
    await queryRunner.query(query);
  }
}
