import { MigrationInterface, QueryRunner } from 'typeorm';

export class FillBalanceSheetColumn1681917409300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const result = await queryRunner.query(
      `SELECT type, version, "companyFacts", ratings FROM "balance_sheet_entity";`
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
