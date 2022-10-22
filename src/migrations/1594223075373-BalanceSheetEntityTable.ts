import { MigrationInterface, QueryRunner } from 'typeorm';

export class BalanceSheetEntityTable1594223075373
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const query = `CREATE TABLE IF NOT EXISTS "balance_sheet_entity" (
            "id" SERIAL NOT NULL, 
            "type" text NOT NULL, 
            "version" text NOT NULL, 
            "companyFacts" jsonb NOT NULL, 
            "ratings" jsonb NOT NULL, 
            CONSTRAINT "PK_balance_sheet_entity" PRIMARY KEY ("id")
        )`;
    await queryRunner.query(query);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const query = 'DROP TABLE IF EXISTS balance_sheet_entity';
    await queryRunner.query(query);
  }
}
