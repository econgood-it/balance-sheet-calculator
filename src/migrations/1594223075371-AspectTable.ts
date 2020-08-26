import { MigrationInterface, QueryRunner } from "typeorm";

export class AspectTable1594223075371 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const query = `CREATE TABLE IF NOT EXISTS "aspect" (
            "id" SERIAL NOT NULL, 
            "shortName" character varying NOT NULL, 
            "name" character varying NOT NULL, 
            "estimations" double precision NOT NULL, 
            "points" double precision NOT NULL, 
            "maxPoints" double precision NOT NULL, 
            "weight" double precision NOT NULL, 
            "topicId" integer, 
            CONSTRAINT "PK_aspect" PRIMARY KEY ("id")
        )`;
        await queryRunner.query(query);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DROP TABLE IF EXISTS aspect`
        await queryRunner.query(query);
    }

}
