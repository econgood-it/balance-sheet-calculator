import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateApiKeyColumn1673619191300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const queries = [
      `CREATE TABLE "api_key"
                   (
                       "id"         SERIAL    NOT NULL, 
                       "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
                       "userId"     integer, 
                       "value"     character varying NOT NULL, 
                       CONSTRAINT "PK_api_key" PRIMARY KEY ("id")
                   )`,
      `ALTER TABLE "api_key" ADD CONSTRAINT "FK_users_api_keys" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    ];
    for (const query of queries) {
      await queryRunner.query(query);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const queries = [
      'ALTER TABLE "api_key" DROP CONSTRAINT "FK_users_api_keys"',
      `DROP TABLE "api_key"`,
    ];
    for (const query of queries) {
      await queryRunner.query(query);
    }
  }
}
