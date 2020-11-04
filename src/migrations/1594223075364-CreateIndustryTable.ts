import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateIndustryTable1594223075364 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        let query = `CREATE TABLE IF NOT EXISTS "industry" (
            "id" SERIAL NOT NULL, 
            "ecologicalSupplyChainRisk" double precision NOT NULL, 
            "industryCode" character varying NOT NULL, 
            CONSTRAINT "PK_industry" PRIMARY KEY ("id")
        )`;
        await queryRunner.query(query);
        query = `CREATE UNIQUE INDEX "IDX_industry_industry_code" ON "industry" ("industryCode")`;
        await queryRunner.query(query);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        let query = `DROP INDEX IF EXISTS "IDX_industry_industry_code"`;
        await queryRunner.query(query);
        query = `DROP TABLE IF EXISTS industry`
        await queryRunner.query(query);
    }

}
