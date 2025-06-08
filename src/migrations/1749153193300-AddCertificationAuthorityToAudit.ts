import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCertificationAuthorityToAudit1749153193300
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "audit_entity" ADD COLUMN "certificationAuthority" VARCHAR(255) DEFAULT 'AUDIT'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const query = `ALTER TABLE "audit_entity" DROP COLUMN "certificationAuthority"`;
    await queryRunner.query(query);
  }
}
