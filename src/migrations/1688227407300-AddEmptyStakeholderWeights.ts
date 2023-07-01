import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmptyStakeholderWeights1688227407300
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const result = await queryRunner.query(
      `SELECT id, "balanceSheet" FROM "balance_sheet_entity";`
    );
    for (const { id, balanceSheet } of result) {
      const balanceSheetJson = {
        ...balanceSheet,
        stakeholderWeights: [],
      };
      await queryRunner.query(
        `UPDATE balance_sheet_entity SET "balanceSheet" = '${JSON.stringify(
          balanceSheetJson
        )}'::jsonb WHERE id = ${id};`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
