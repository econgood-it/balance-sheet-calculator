import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubmittedAtToAudit1742484540300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "audit_entity" ADD COLUMN "submittedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
    );
    await queryRunner.query(
      `ALTER TABLE "audit_entity" ALTER COLUMN "submittedAt" DROP DEFAULT`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const query = `ALTER TABLE "audit_entity" DROP COLUMN "submittedAt"`;
    await queryRunner.query(query);
  }
}
