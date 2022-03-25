import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForeignKeyConstraints1594223075374
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const queries = [
      `ALTER TABLE "industry_sector" ADD CONSTRAINT "FK_industry_sector_company_facts" FOREIGN KEY 
        ("companyFactsId") REFERENCES "company_facts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "employees_fraction" ADD CONSTRAINT "FK_employees_fraction_company_facts" FOREIGN KEY 
        ("companyFactsId") REFERENCES "company_facts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "supply_fraction" ADD CONSTRAINT "FK_supply_fraction_company_facts" FOREIGN KEY 
        ("companyFactsId") REFERENCES "company_facts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "rating" ADD CONSTRAINT "FK_rating_balance_sheet" FOREIGN KEY 
        ("balanceSheetId") REFERENCES "balance_sheet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "balance_sheet" ADD CONSTRAINT "FK_balance_sheet_company_facts" FOREIGN KEY 
        ("companyFactsId") REFERENCES "company_facts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    ];
    for (const query of queries) {
      await queryRunner.query(query);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const queries = [
      'ALTER TABLE "industry_sector" DROP CONSTRAINT "FK_industry_sector_company_facts"',
      'ALTER TABLE "employees_fraction" DROP CONSTRAINT "FK_employees_fraction_company_facts"',
      'ALTER TABLE "supply_fraction" DROP CONSTRAINT "FK_supply_fraction_company_facts"',
      'ALTER TABLE "rating" DROP CONSTRAINT "FK_rating_balance_sheet"',
      'ALTER TABLE "balance_sheet" DROP CONSTRAINT "FK_balance_sheet_company_facts"',
    ];
    for (const query of queries) {
      await queryRunner.query(query);
    }
  }
}
