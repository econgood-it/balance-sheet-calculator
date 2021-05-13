import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIndustrySectorTable1594223075363
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const query = `CREATE TABLE IF NOT EXISTS "industry_sector" (
            "id" SERIAL NOT NULL, 
            "industryCode" character varying NOT NULL, 
            "description" character varying NOT NULL, 
            "amountOfTotalTurnover" double precision NOT NULL, 
            "companyFactsId" integer, 
            CONSTRAINT "PK_industry_sector" PRIMARY KEY ("id")
        )`;
    await queryRunner.query(query);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const query = 'DROP TABLE IF EXISTS industry_sector';
    await queryRunner.query(query);
  }
}
