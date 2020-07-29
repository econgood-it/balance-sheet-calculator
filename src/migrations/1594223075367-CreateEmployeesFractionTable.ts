import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmployeesFractionTable1594223075367 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const query = `CREATE TABLE IF NOT EXISTS "employees_fraction" (
            "id" SERIAL NOT NULL, 
            "countryCode" character varying NOT NULL, 
            "percentage" double precision NOT NULL, 
            "companyFactsId" integer, 
            PRIMARY KEY ("id"), 
            FOREIGN KEY ("companyFactsId") REFERENCES company_facts("id")
        )`;
        queryRunner.query(query);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DROP TABLE NOT EXISTS employees_fraction`
        queryRunner.query(query);
    }

}
