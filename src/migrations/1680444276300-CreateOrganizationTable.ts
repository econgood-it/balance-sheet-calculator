import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrganizationTableimplements1680444276300
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const queries = [
      `CREATE TABLE "organization_entity"
                   (
                       "id"         SERIAL    NOT NULL,
                       "organization" jsonb NOT NULL, 
                       CONSTRAINT "PK_organization_entity" PRIMARY KEY ("id")
                   )`,
    ];
    for (const query of queries) {
      await queryRunner.query(query);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const queries = [`DROP TABLE "organization_entity"`];
    for (const query of queries) {
      await queryRunner.query(query);
    }
  }
}
