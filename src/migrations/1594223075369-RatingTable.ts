import { MigrationInterface, QueryRunner } from "typeorm";

export class RatingTable1594223075369 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const query = `CREATE TABLE IF NOT EXISTS "rating" (
            "id" SERIAL NOT NULL, 
            CONSTRAINT "PK_ecda8ad32645327e4765b43649e" PRIMARY KEY ("id")
        )`;
        await queryRunner.query(query);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DROP TABLE IF EXISTS rating`
        await queryRunner.query(query);
    }

}
