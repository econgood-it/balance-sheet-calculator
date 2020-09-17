import { MigrationInterface, QueryRunner } from "typeorm";

export class BalanceSheetTable1594223075373 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const query = `CREATE TABLE IF NOT EXISTS "balance_sheet" (
            "id" SERIAL NOT NULL, 
            "type" text NOT NULL, 
            "version" text NOT NULL, 
            "companyFactsId" integer, 
            "ratingId" integer, 
            CONSTRAINT "REL_1a39d5f0f66c81e7ff783a6cb7" UNIQUE ("companyFactsId"), 
            CONSTRAINT "REL_2d807f3f803c690884762f8902" UNIQUE ("ratingId"), 
            CONSTRAINT "PK_2e4833bdf708f40fb84fd112949" PRIMARY KEY ("id")
        )`;
        await queryRunner.query(query);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DROP TABLE IF EXISTS balance_sheet`
        await queryRunner.query(query);
    }

}
