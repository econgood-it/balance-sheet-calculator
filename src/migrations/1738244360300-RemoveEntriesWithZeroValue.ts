import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveEntriesWithZeroValue1738244360300
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const result = await queryRunner.query(
      `SELECT id, "balanceSheet" FROM "balance_sheet_entity";`
    );
    for (const { id, balanceSheet } of result) {
      const balanceSheetJson = {
        ...balanceSheet,
        companyFacts: {
          ...balanceSheet.companyFacts,
          supplyFractions: balanceSheet.companyFacts.supplyFractions.filter(
            (sf: any) => sf.costs > 0
          ),
          industrySectors: balanceSheet.companyFacts.industrySectors.filter(
            (sf: any) => sf.amountOfTotalTurnover > 0
          ),
          employeesFractions:
            balanceSheet.companyFacts.employeesFractions.filter(
              (sf: any) => sf.percentage > 0
            ),
        },
      };
      await queryRunner.query(
        `UPDATE balance_sheet_entity SET "balanceSheet" = '${JSON.stringify(
          balanceSheetJson
        )}'::jsonb WHERE id = ${id};`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
