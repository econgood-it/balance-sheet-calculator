import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCompanyFactsTable1594223075366 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const query = `CREATE TABLE IF NOT EXISTS "company_facts" (
            "id" SERIAL NOT NULL, 
            "totalPurchaseFromSuppliers" double precision NOT NULL, 
            "totalStaffCosts" double precision NOT NULL, 
            "profit" double precision NOT NULL, 
            "financialCosts" double precision NOT NULL, 
            "incomeFromFinancialInvestments" double precision NOT NULL, 
            "additionsToFixedAssets" double precision NOT NULL, 
            "turnover" double precision NOT NULL, 
            "totalAssets" double precision NOT NULL, 
            "financialAssetsAndCashBalance" double precision NOT NULL, 
            "totalSales" double precision NOT NULL, 
            "numberOfEmployees" double precision NOT NULL,
            "hasCanteen" boolean NOT NULL, 
            CONSTRAINT "PK_company_facts" PRIMARY KEY ("id")
        )`;
        await queryRunner.query(query);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DROP TABLE IF EXISTS company_facts`
        await queryRunner.query(query);
    }

}
