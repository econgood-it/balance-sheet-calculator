import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrganizationMembersTable1680972090300
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const query = `CREATE TABLE IF NOT EXISTS "organization_members" (
            "organizationEntityId" integer NOT NULL, 
            "userId" integer NOT NULL,
            CONSTRAINT "PK_organization_members" PRIMARY KEY ("organizationEntityId", "userId")
        )`;
    await queryRunner.query(query);
    const indexQueries = [
      `CREATE INDEX "IDX_organization_members_organization_entity_id" ON "organization_members" ("organizationEntityId")`,
      `CREATE INDEX "IDX_organization_members_user_id" ON "organization_members" ("userId")`,
    ];
    for (const indexQuery of indexQueries) {
      await queryRunner.query(indexQuery);
    }
    const foreignKeysQueries = [
      `ALTER TABLE "organization_members" ADD CONSTRAINT "FK_organization_members_organization_entity" FOREIGN KEY ("organizationEntityId") REFERENCES "organization_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      `ALTER TABLE "organization_members"
          ADD CONSTRAINT "FK_organization_members_member" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    ];
    for (const foreignKeyQuery of foreignKeysQueries) {
      await queryRunner.query(foreignKeyQuery);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const indexQueries = [
      `DROP INDEX IF EXISTS "IDX_organization_members_organization_entity_id"`,
      `DROP INDEX IF EXISTS "IDX_organization_members_user_id"`,
    ];
    for (const indexQuery of indexQueries) {
      await queryRunner.query(indexQuery);
    }

    const foreignKeysQueries = [
      'ALTER TABLE "organization_members" DROP CONSTRAINT "FK_organization_members_organization_entity"',
      'ALTER TABLE "organization_members" DROP CONSTRAINT "FK_organization_members_member"',
    ];

    for (const foreignKeyQuery of foreignKeysQueries) {
      await queryRunner.query(foreignKeyQuery);
    }

    const query = `DROP TABLE IF EXISTS organization_members`;
    await queryRunner.query(query);
  }
}
