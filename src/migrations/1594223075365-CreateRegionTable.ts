import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRegionTable1594223075365 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    let query = `CREATE TABLE IF NOT EXISTS "region" (
            "id" SERIAL NOT NULL, 
            "pppIndex" double precision NOT NULL, 
            "countryCode" character varying NOT NULL, 
            "countryName" character varying NOT NULL,
            "ituc" double precision NOT NULL,  
            CONSTRAINT "PK_region" PRIMARY KEY ("id")
        )`;
    await queryRunner.query(query);
    query =
      'CREATE UNIQUE INDEX "IDX_region_country_code" ON "region" ("countryCode")';
    await queryRunner.query(query);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    let query = 'DROP INDEX IF EXISTS "IDX_region_country_code"';
    await queryRunner.query(query);
    query = 'DROP TABLE IF EXISTS region';
    await queryRunner.query(query);
  }
}
