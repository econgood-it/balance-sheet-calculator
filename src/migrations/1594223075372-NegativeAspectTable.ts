import { MigrationInterface, QueryRunner } from "typeorm";

export class NegativeAspectTable1594223075372 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const query = `CREATE TABLE IF NOT EXISTS "negative_aspect" (
            "id" SERIAL NOT NULL, 
            "shortName" character varying NOT NULL, 
            "name" character varying NOT NULL, 
            "estimations" double precision NOT NULL, 
            "points" double precision NOT NULL, 
            "maxPoints" double precision NOT NULL, 
            "topicId" integer, 
            CONSTRAINT "PK_negative_aspect" PRIMARY KEY ("id")
        )`;
        await queryRunner.query(query);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DROP TABLE IF EXISTS negative_aspect`
        await queryRunner.query(query);
    }

}
