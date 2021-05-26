import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1620894033594 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    let query = `CREATE TABLE IF NOT EXISTS "user" (
            "id" SERIAL NOT NULL, 
            "email" character varying NOT NULL, 
            "password" character varying NOT NULL,
            "role" character varying NOT NULL, 
            CONSTRAINT "PK_user" PRIMARY KEY ("id")
        )`;
    await queryRunner.query(query);
    query = `CREATE UNIQUE INDEX "IDX_user_email" ON "user" ("email")`;
    await queryRunner.query(query);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    let query = `DROP INDEX IF EXISTS "IDX_user_email"`;
    await queryRunner.query(query);
    query = `DROP TABLE IF EXISTS user`;
    await queryRunner.query(query);
  }
}
