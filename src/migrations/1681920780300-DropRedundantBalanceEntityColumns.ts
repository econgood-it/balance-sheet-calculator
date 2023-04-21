import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropRedundantBalanceEntityColumns1681920780300
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const result = await queryRunner.query(
      `ALTER TABLE "balance_sheet_entity" DROP COLUMN companyFacts, DROP COLUMN;`
    );
    for (const { type, version, companyFacts, ratings } of result) {
      const balanceSheetJson = {
        type: type,
        version: version,
        companyFacts: companyFacts,
        ratings: ratings,
      };
      await queryRunner.query(
        `UPDATE balance_sheet_entity SET balanceSheet = '${JSON.stringify(
          balanceSheetJson
        )}'::jsonb;`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const query = 'DROP TABLE IF EXISTS balance_sheet_entity';
    await queryRunner.query(query);
  }
}
