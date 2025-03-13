import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditTable1740068748300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const queries = [
      `CREATE TABLE "audit_entity"
                   (
                       "id"         SERIAL    NOT NULL,
                       "submittedBalanceSheetId"         SERIAL    NOT NULL,
                       "originalCopyId"  SERIAL    NOT NULL,
                       "auditCopyId"  SERIAL    NOT NULL,
                       CONSTRAINT "PK_audit_entity" PRIMARY KEY ("id")
                   )`,
    ];
    for (const query of queries) {
      await queryRunner.query(query);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const queries = [`DROP TABLE "audit_entity"`];
    for (const query of queries) {
      await queryRunner.query(query);
    }
  }
}
