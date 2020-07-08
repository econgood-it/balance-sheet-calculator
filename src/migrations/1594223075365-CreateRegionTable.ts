import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRegionTable1594223075365 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const query = `CREATE TABLE IF NOT EXISTS "region" (
            "id" SERIAL NOT NULL, 
            "pppIndex" double precision NOT NULL, 
            "countryCode" character varying NOT NULL, 
            "countryName" character varying NOT NULL, 
            CONSTRAINT "PK_5f48ffc3af96bc486f5f3f3a6da" PRIMARY KEY ("id")
        )`;

        queryRunner.query(query);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DROP TABLE IF NOT EXISTS Region`
        queryRunner.query(query);
    }

}
