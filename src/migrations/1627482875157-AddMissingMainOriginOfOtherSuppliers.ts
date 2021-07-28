import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingMainOriginOfOtherSuppliers1627482875157
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const query = `SELECT * FROM "company_facts" WHERE "mainOriginOfOtherSuppliers" IS NULL`;
    const res = await queryRunner.query(query);
    for (const cf of res) {
      const sumOfSupplyFraction = await queryRunner.query(
        `SELECT SUM(costs) FROM "supply_fraction" WHERE "companyFactsId"=${cf.id}`
      );
      const insertQuery = `INSERT INTO "main_origin_of_other_suppliers" ("countryCode", "costs") VALUES ('DEFAULT_COUNTRY', ${
        cf.totalPurchaseFromSuppliers - sumOfSupplyFraction[0].sum
      }) returning "id"`;
      const mainOriginOfOtherSuppliers = await queryRunner.query(insertQuery);
      await queryRunner.query(
        `UPDATE "company_facts" SET "mainOriginOfOtherSuppliers" = ${mainOriginOfOtherSuppliers[0].id} WHERE "id"=${cf.id}`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
