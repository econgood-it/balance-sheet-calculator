import { MigrationInterface, QueryRunner } from "typeorm";

export class TopicTable1594223075370 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const query = `CREATE TABLE IF NOT EXISTS "topic" (
            "id" SERIAL NOT NULL, 
            "shortName" character varying NOT NULL, 
            "name" character varying NOT NULL, 
            "estimations" double precision NOT NULL, 
            "points" double precision NOT NULL, 
            "maxPoints" double precision NOT NULL, 
            "weight" double precision NOT NULL, 
            "isWeightSelectedByUser" boolean NOT NULL, 
            "ratingId" integer, 
            CONSTRAINT "PK_33aa4ecb4e4f20aa0157ea7ef61" PRIMARY KEY ("id")
        )`;
        await queryRunner.query(query);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DROP TABLE IF EXISTS topic`
        await queryRunner.query(query);
    }

}
