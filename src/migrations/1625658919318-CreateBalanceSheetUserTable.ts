import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBalanceSheetUserTable1625658919318
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const query = `CREATE TABLE IF NOT EXISTS "balance_sheet_entities_users" (
            "balanceSheetEntityId" integer NOT NULL, 
            "userId" integer NOT NULL,
            CONSTRAINT "PK_balance_sheet_entities_users" PRIMARY KEY ("balanceSheetEntityId", "userId")
        )`;
    await queryRunner.query(query);
    const indexQueries = [
      `CREATE INDEX "IDX_balance_sheet_entities_users_balance_sheet_id" ON "balance_sheet_entities_users" ("balanceSheetEntityId")`,
      `CREATE INDEX "IDX_balance_sheet_entities_users_user_id" ON "balance_sheet_entities_users" ("userId")`,
    ];
    for (const indexQuery of indexQueries) {
      await queryRunner.query(indexQuery);
    }
    const foreignKeysQueries = [
      `ALTER TABLE "balance_sheet_entities_users" ADD CONSTRAINT "FK_balance_sheet_entities_users_balance_sheet" FOREIGN KEY ("balanceSheetEntityId") REFERENCES "balance_sheet_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "balance_sheet_entities_users"
          ADD CONSTRAINT "FK_balance_sheet_entities_users_user" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    ];
    for (const foreignKeyQuery of foreignKeysQueries) {
      await queryRunner.query(foreignKeyQuery);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const indexQueries = [
      `DROP INDEX IF EXISTS "IDX_balance_sheet_entities_users_balance_sheet_id"`,
      `DROP INDEX IF EXISTS "IDX_balance_sheet_entities_users_user_id"`,
    ];
    for (const indexQuery of indexQueries) {
      await queryRunner.query(indexQuery);
    }

    const foreignKeysQueries = [
      'ALTER TABLE "balance_sheet_entities_users" DROP CONSTRAINT "FK_balance_sheet_entities_users_balance_sheet"',
      'ALTER TABLE "balance_sheet_entities_users" DROP CONSTRAINT "FK_balance_sheet_entities_users_user"',
    ];

    for (const foreignKeyQuery of foreignKeysQueries) {
      await queryRunner.query(foreignKeyQuery);
    }

    const query = `DROP TABLE IF EXISTS balance_sheet_entities_users`;
    await queryRunner.query(query);
  }
}
