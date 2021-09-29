import { MigrationInterface, QueryRunner } from 'typeorm';
import { BalanceSheetVersion } from '../entities/enums';

export class AddVersionColToRegionTable1632921926503
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const query = `ALTER TABLE "region" ADD "validFromVersion" character varying NOT NULL DEFAULT '${BalanceSheetVersion.v5_0_4}'`;
    await queryRunner.query(query);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const query = `ALTER TABLE "region" DROP COLUMN "validFromVersion"`;
    await queryRunner.query(query);
  }
}
