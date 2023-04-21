import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnBalanceSheet1681917407300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const query = `ALTER TABLE "balance_sheet_entity" ADD COLUMN "balanceSheet" jsonb NOT NULL DEFAULT '{}'::jsonb;`;

    await queryRunner.query(query);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const query = `ALTER TABLE "balance_sheet_entity" DROP COLUMN "balanceSheet"`;
    await queryRunner.query(query);
  }
}
