import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUniqueConstraintsOfRegionTable1632928054750
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const queries = [
      `DROP INDEX IF EXISTS "IDX_region_country_code"`,
      `CREATE INDEX "IDX_region_country_code" ON "region" ("countryCode")`,
      `ALTER TABLE region ADD CONSTRAINT "CON_region_country_code_version" UNIQUE ("countryCode", "validFromVersion")`,
    ];
    for (const query of queries) {
      await queryRunner.query(query);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const queries = [
      `ALTER TABLE "region" DROP CONSTRAINT "CON_region_country_code_version"`,
      `DROP INDEX IF EXISTS "IDX_region_country_code"`,
      `CREATE INDEX "IDX_region_country_code" ON "region" ("countryCode")`,
    ];
    for (const query of queries) {
      await queryRunner.query(query);
    }
  }
}
