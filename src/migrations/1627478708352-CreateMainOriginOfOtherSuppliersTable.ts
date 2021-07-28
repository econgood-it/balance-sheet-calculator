import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMainOriginOfOtherSuppliersTable1627478708352
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const query = `CREATE TABLE IF NOT EXISTS "main_origin_of_other_suppliers" (
            "id" SERIAL NOT NULL, 
            "countryCode" character varying NOT NULL, 
            "costs" double precision NOT NULL, 
            CONSTRAINT "PK_main_origin_of_other_suppliers" PRIMARY KEY ("id")
        )`;
    await queryRunner.query(query);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const query = 'DROP TABLE IF EXISTS main_origin_of_other_suppliers';
    await queryRunner.query(query);
  }
}
