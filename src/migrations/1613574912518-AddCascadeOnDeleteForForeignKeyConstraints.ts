import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCascadeOnDeleteForForeignKeyConstraints1613574912518 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const queries = [
      `ALTER TABLE "industry_sector" DROP CONSTRAINT "FK_industry_sector_company_facts"`,
      `ALTER TABLE "industry_sector" ADD CONSTRAINT "FK_industry_sector_company_facts" FOREIGN KEY 
        ("companyFactsId") REFERENCES "company_facts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "employees_fraction" DROP CONSTRAINT "FK_employees_fraction_company_facts"`,
      `ALTER TABLE "employees_fraction" ADD CONSTRAINT "FK_employees_fraction_company_facts" FOREIGN KEY 
        ("companyFactsId") REFERENCES "company_facts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "supply_fraction" DROP CONSTRAINT "FK_supply_fraction_company_facts"`,
      `ALTER TABLE "supply_fraction" ADD CONSTRAINT "FK_supply_fraction_company_facts" FOREIGN KEY 
        ("companyFactsId") REFERENCES "company_facts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "topic" DROP CONSTRAINT "FK_topic_rating"`,
      `ALTER TABLE "topic" ADD CONSTRAINT "FK_topic_rating" FOREIGN KEY 
        ("ratingId") REFERENCES "rating"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "aspect" DROP CONSTRAINT "FK_aspect_topic"`,
      `ALTER TABLE "aspect" ADD CONSTRAINT "FK_aspect_topic" FOREIGN KEY 
        ("topicId") REFERENCES "topic"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "balance_sheet" DROP CONSTRAINT "FK_balance_sheet_company_facts"`,
      `ALTER TABLE "balance_sheet" ADD CONSTRAINT "FK_balance_sheet_company_facts" FOREIGN KEY 
        ("companyFactsId") REFERENCES "company_facts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "balance_sheet" DROP CONSTRAINT "FK_balance_sheet_rating"`,
      `ALTER TABLE "balance_sheet" ADD CONSTRAINT "FK_balance_sheet_rating" FOREIGN KEY
          ("ratingId") REFERENCES "rating"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
          ]
    for (const query of queries) {
      await queryRunner.query(query);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const queries = [
      `ALTER TABLE "industry_sector" DROP CONSTRAINT "FK_industry_sector_company_facts"`,
      `ALTER TABLE "industry_sector" ADD CONSTRAINT "FK_industry_sector_company_facts" FOREIGN KEY 
        ("companyFactsId") REFERENCES "company_facts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      `ALTER TABLE "employees_fraction" DROP CONSTRAINT "FK_employees_fraction_company_facts"`,
      `ALTER TABLE "employees_fraction" ADD CONSTRAINT "FK_employees_fraction_company_facts" FOREIGN KEY 
        ("companyFactsId") REFERENCES "company_facts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      `ALTER TABLE "supply_fraction" DROP CONSTRAINT "FK_supply_fraction_company_facts"`,
      `ALTER TABLE "supply_fraction" ADD CONSTRAINT "FK_supply_fraction_company_facts" FOREIGN KEY 
        ("companyFactsId") REFERENCES "company_facts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      `ALTER TABLE "topic" DROP CONSTRAINT "FK_topic_rating"`,
      `ALTER TABLE "topic" ADD CONSTRAINT "FK_topic_rating" FOREIGN KEY 
        ("ratingId") REFERENCES "rating"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      `ALTER TABLE "aspect" DROP CONSTRAINT "FK_aspect_topic"`,
      `ALTER TABLE "aspect" ADD CONSTRAINT "FK_aspect_topic" FOREIGN KEY 
        ("topicId") REFERENCES "topic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      `ALTER TABLE "balance_sheet" DROP CONSTRAINT "FK_balance_sheet_company_facts"`,
      `ALTER TABLE "balance_sheet" ADD CONSTRAINT "FK_balance_sheet_company_facts" FOREIGN KEY 
        ("companyFactsId") REFERENCES "company_facts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      `ALTER TABLE "balance_sheet" DROP CONSTRAINT "FK_balance_sheet_rating"`,
      `ALTER TABLE "balance_sheet" ADD CONSTRAINT "FK_balance_sheet_rating" FOREIGN KEY
          ("ratingId") REFERENCES "rating"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    ]
    for (const query of queries) {
      await queryRunner.query(query);
    }
  }

}
