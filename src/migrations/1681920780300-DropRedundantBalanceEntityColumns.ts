import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropRedundantBalanceEntityColumns1681920780300
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const query = `ALTER TABLE "balance_sheet_entity" DROP COLUMN "companyFacts", DROP COLUMN ratings, DROP COLUMN version, DROP COLUMN "type";`;
    await queryRunner.query(query);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const queries = [
      `ALTER TABLE "balance_sheet_entity" ADD COLUMN "companyFacts" jsonb NOT NULL DEFAULT '{}'::jsonb;`,
      `ALTER TABLE "balance_sheet_entity" ADD COLUMN "ratings" jsonb NOT NULL DEFAULT '{}'::jsonb;`,
      `ALTER TABLE "balance_sheet_entity" ADD COLUMN "version" text NOT NULL DEFAULT '';`,
      `ALTER TABLE "balance_sheet_entity" ADD COLUMN "type" text NOT NULL DEFAULT '';`,
    ];

    for (const query of queries) {
      await queryRunner.query(query);
    }
    const result = await queryRunner.query(
      `SELECT id, "balanceSheet" FROM "balance_sheet_entity";`
    );
    for (const { id, balanceSheet } of result) {
      await queryRunner.query(
        `UPDATE balance_sheet_entity SET "companyFacts" = '${JSON.stringify(
          balanceSheet.companyFacts
        )}'::jsonb, ratings = '${JSON.stringify(
          balanceSheet.ratings
        )}'::jsonb, version = '${balanceSheet.version}', "type" = '${
          balanceSheet.type
        }' WHERE id = ${id}`
      );
    }
    await queryRunner.query(
      `ALTER TABLE "balance_sheet_entity" DROP COLUMN "balanceSheet";`
    );
  }
}
