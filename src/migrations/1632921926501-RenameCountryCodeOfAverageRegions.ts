import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameCountryCodeOfAverageRegions1632921926501
  implements MigrationInterface
{
  RENAME_MAP = new Map([
    ['DEFAULT_COUNTRY_CODE', 'AWO'],
    ['Average Oceania', 'AOC'],
    ['Average Europe', 'AEU'],
    ['Average Asia', 'AAS'],
    ['Average Americas', 'AAM'],
    ['Average Africa', 'AAF'],
  ]);

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [key, value] of this.RENAME_MAP) {
      const query = `UPDATE region SET "countryCode"=$1 WHERE "countryCode"=$2`;
      await queryRunner.query(query, [value, key]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const [key, value] of this.RENAME_MAP) {
      const query = `UPDATE region SET "countryCode"=$1 WHERE "countryCode"=$2`;
      await queryRunner.query(query, [key, value]);
    }
  }
}
