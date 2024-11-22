import { MigrationInterface, QueryRunner } from 'typeorm';
import { omit } from 'lodash';

export class RemoveRatingNames1732263791300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const result = await queryRunner.query(
      `SELECT id, "balanceSheet" FROM "balance_sheet_entity";`
    );
    for (const { id, balanceSheet } of result) {
      const newRatings = balanceSheet.ratings.map((r: any) =>
        omit(r, ['name'])
      );
      await queryRunner.query(
        `UPDATE balance_sheet_entity SET "balanceSheet" = '${JSON.stringify({
          ...balanceSheet,
          ratings: newRatings,
        })}'::jsonb WHERE id = ${id};`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
