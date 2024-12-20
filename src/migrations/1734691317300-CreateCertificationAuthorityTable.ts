import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCertificationAuthorityTable1734691317300
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "certification_authority_entity"
           (
               "name" text NOT NULL,
               "organizationEntityId" integer,
               CONSTRAINT "PK_certification_authority_entity" PRIMARY KEY ("name")
           )`
    );
    const constraintQuery = `ALTER TABLE "certification_authority_entity" ADD CONSTRAINT "FK_certification_authority_organization" FOREIGN KEY ("organizationEntityId") REFERENCES "organization_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`;
    await queryRunner.query(constraintQuery);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "certification_authority_entity"`);
  }
}
