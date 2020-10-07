import { MigrationInterface, QueryRunner } from "typeorm";

export class AddForeignKeyConstraints1594223075374 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const queries = [
            `ALTER TABLE "employees_fraction" ADD CONSTRAINT "FK_employees_fraction_company_facts" FOREIGN KEY 
        ("companyFactsId") REFERENCES "company_facts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            `ALTER TABLE "supply_fraction" ADD CONSTRAINT "FK_supply_fraction_company_facts" FOREIGN KEY 
        ("companyFactsId") REFERENCES "company_facts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            `ALTER TABLE "topic" ADD CONSTRAINT "FK_topic_rating" FOREIGN KEY 
        ("ratingId") REFERENCES "rating"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            `ALTER TABLE "aspect" ADD CONSTRAINT "FK_aspect_topic" FOREIGN KEY 
        ("topicId") REFERENCES "topic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            `ALTER TABLE "balance_sheet" ADD CONSTRAINT "FK_balance_sheet_company_facts" FOREIGN KEY 
        ("companyFactsId") REFERENCES "company_facts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            `ALTER TABLE "balance_sheet" ADD CONSTRAINT "FK_balance_sheet_rating" FOREIGN KEY 
        ("ratingId") REFERENCES "rating"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        ]
        for (const query of queries) {
            await queryRunner.query(query);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const queries = [
            `ALTER TABLE employees_fraction DROP CONSTRAINT FK_d32a96afb1b14d2762b7944c8c2`,
            `ALTER TABLE supply_fraction DROP CONSTRAINT FK_615e6151f3cedec403361a88f1d`,
            `ALTER TABLE topic DROP CONSTRAINT FK_1b04d4d4782b6d1dc514ea3fc09`,
            `ALTER TABLE aspect DROP CONSTRAINT FK_aspect_topic`,
            `ALTER TABLE balance_sheet DROP CONSTRAINT FK_1a39d5f0f66c81e7ff783a6cb7f`,
            `ALTER TABLE balance_sheet DROP CONSTRAINT FK_2d807f3f803c690884762f8902d`,
        ]
        for (const query of queries) {
            await queryRunner.query(query);
        }
    }

}
