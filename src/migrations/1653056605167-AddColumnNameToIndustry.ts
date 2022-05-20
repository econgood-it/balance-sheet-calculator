import { MigrationInterface, QueryRunner } from 'typeorm';
import path from 'path';
import { IndustryReader } from '../reader/industry.reader';
import { Industry } from '../entities/industry';

export class AddColumnNameToIndustry1653056605167
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const query = `ALTER TABLE "industry" ADD "name" character varying`;
    await queryRunner.query(query);
    const pathToCsv = path.join(
      path.resolve(__dirname, '../files/reader'),
      'industry.csv'
    );
    const industryReader: IndustryReader = new IndustryReader();
    const industries: Industry[] = await industryReader.read(pathToCsv);
    for (const industry of industries) {
      const updateQuery = `UPDATE "industry" SET "name"=$1 WHERE "industryCode"=$2`;
      await queryRunner.query(updateQuery, [
        industry.name,
        industry.industryCode,
      ]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const query = `ALTER TABLE "industry" DROP COLUMN "name"`;
    await queryRunner.query(query);
  }
}
