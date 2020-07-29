import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSupplyFractionTable1594223075368 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const query = `CREATE TABLE IF NOT EXISTS "supply_fraction" (
            "id" SERIAL NOT NULL, 
            "countryCode" character varying NOT NULL, 
            "costs" double precision NOT NULL, 
            "companyFactsId" integer, 
            PRIMARY KEY ("id"), 
            FOREIGN KEY ("companyFactsId") REFERENCES company_facts("id")
        )`;
        queryRunner.query(query);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DROP TABLE IF EXISTS supply_fraction`
        queryRunner.query(query);
    }

}
