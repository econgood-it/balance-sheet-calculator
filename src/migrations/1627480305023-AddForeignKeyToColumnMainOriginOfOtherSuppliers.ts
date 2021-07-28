import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForeignKeyToColumnMainOriginOfOtherSuppliers1627480305023
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const queries = [
      `ALTER TABLE "company_facts" ADD CONSTRAINT "REL_company_facts_main_origin_of_other_suppliers" UNIQUE ("mainOriginOfOtherSuppliers")`,
      `ALTER TABLE "company_facts" ADD CONSTRAINT "FK_company_facts_main_origin_of_other_suppliers" FOREIGN KEY 
        ("mainOriginOfOtherSuppliers") REFERENCES "main_origin_of_other_suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    ];
    for (const query of queries) {
      await queryRunner.query(query);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const queries = [
      'ALTER TABLE "company_facts" DROP CONSTRAINT "REL_company_facts_main_origin_of_other_suppliers"',
      'ALTER TABLE "company_facts" DROP CONSTRAINT "FK_company_facts_main_origin_of_other_suppliers"',
    ];
    for (const query of queries) {
      await queryRunner.query(query);
    }
  }
}
