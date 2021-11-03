import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameAverageCountryCodesInBalanceSheets1635940559586
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

  TABLES = [
    'employees_fraction',
    'supply_fraction',
    'main_origin_of_other_suppliers',
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of this.TABLES) {
      await this.renameAverageCountryCodes(queryRunner, true, table);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of this.TABLES) {
      await this.renameAverageCountryCodes(queryRunner, false, table);
    }
  }

  private async renameAverageCountryCodes(
    queryRunner: QueryRunner,
    migrateUp: boolean,
    table: string
  ) {
    for (const [key, value] of this.RENAME_MAP) {
      const query = `UPDATE ${table} SET "countryCode"=$1 WHERE "countryCode"=$2`;
      if (migrateUp) {
        await queryRunner.query(query, [value, key]);
      } else {
        await queryRunner.query(query, [key, value]);
      }
    }
  }
}
