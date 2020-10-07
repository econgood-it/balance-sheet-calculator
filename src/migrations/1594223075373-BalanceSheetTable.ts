import { MigrationInterface, QueryRunner } from "typeorm";

export class BalanceSheetTable1594223075373 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const query = `CREATE TABLE IF NOT EXISTS "balance_sheet" (
            "id" SERIAL NOT NULL, 
            "type" text NOT NULL, 
            "version" text NOT NULL, 
            "companyFactsId" integer, 
            "ratingId" integer, 
            CONSTRAINT "REL_balance_sheet_company_facts" UNIQUE ("companyFactsId"), 
            CONSTRAINT "REL_balance_sheet_rating" UNIQUE ("ratingId"), 
            CONSTRAINT "PK_balance_sheet" PRIMARY KEY ("id")
        )`;
        await queryRunner.query(query);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DROP TABLE IF EXISTS balance_sheet`
        await queryRunner.query(query);
    }

}
