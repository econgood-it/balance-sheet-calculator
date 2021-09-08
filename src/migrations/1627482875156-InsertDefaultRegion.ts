import { MigrationInterface, QueryRunner } from 'typeorm';
import { DEFAULT_COUNTRY_CODE } from '../entities/region';

export class InsertDefaultRegion1627482875156 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const insertQuery = `INSERT INTO "region" ("countryCode", "pppIndex","countryName","ituc") VALUES ('${DEFAULT_COUNTRY_CODE}', ${1.00304566871495}, 'World', ${3.23809523809524});`;
    await queryRunner.query(insertQuery);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const deleteQuery = `DELETE FROM "region" WHERE "countryCode"="${DEFAULT_COUNTRY_CODE}";`;
    await queryRunner.query(deleteQuery);
  }
}
