import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRegionTable1594223075365 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const query = `CREATE TABLE IF NOT EXISTS "region" (
            "id" SERIAL NOT NULL, 
            "pppIndex" double precision NOT NULL, 
            "countryCode" character varying NOT NULL,  
            "countryName" character varying NOT NULL,
            "validFromVersion" character varying NOT NULL, 
            "ituc" double precision NOT NULL, 
            CONSTRAINT "PK_region" PRIMARY KEY ("id")
        )`;
    await queryRunner.query(query);
    const constraintQueries = [
      `CREATE INDEX "IDX_region_country_code" ON "region" ("countryCode")`,
      `ALTER TABLE region ADD CONSTRAINT "CON_region_country_code_version" UNIQUE ("countryCode", "validFromVersion")`,
    ];
    for (const constraintQuery of constraintQueries) {
      await queryRunner.query(constraintQuery);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    let query = 'DROP INDEX IF EXISTS "IDX_region_country_code"';
    await queryRunner.query(query);
    query = 'DROP TABLE IF EXISTS region';
    await queryRunner.query(query);
  }
}
