import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSupplyFractionTable1594223075368 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const query = `CREATE TABLE IF NOT EXISTS "supply_fraction" (
            "id" SERIAL NOT NULL, 
            "countryCode" character varying NOT NULL, 
            "costs" double precision NOT NULL, 
            "companyFactsId" integer, 
            CONSTRAINT "PK_96da23328a4beb9562e33fbd9fb" PRIMARY KEY ("id")
        )`;
        await queryRunner.query(query);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DROP TABLE IF EXISTS supply_fraction`
        await queryRunner.query(query);
    }

}
