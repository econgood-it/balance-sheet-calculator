import {MigrationInterface, QueryRunner} from "typeorm";
export class ReplaceAspectNamesByI18nKeys1616588129420 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.replaceAspectNamesByI18Keys('v5:compact', 'Compact', queryRunner);
    await this.replaceAspectNamesByI18Keys('v5:full', 'Full', queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const query = `ALTER TABLE "industry_sector" ALTER COLUMN "description" set data type character varying USING description::json->>'en';`
    await queryRunner.query(query);
  }

  private async replaceAspectNamesByI18Keys(i18nPrefix: string, balanceSheetType: string, queryRunner: QueryRunner) {
    await queryRunner.query(this.updateQuery(i18nPrefix, balanceSheetType));
  }

  private updateQuery(i18nPrefix: string, balanceSheetType: string): string {
    const from = 'FROM balance_sheet b, rating r, topic t';
    const where = `where b.type = '${balanceSheetType}' and b."ratingId" = r.id and t."ratingId" = r.id and t.id = aspect."topicId"`
    return `UPDATE aspect SET name=concat('${i18nPrefix}.', aspect."shortName") ${from} ${where};`;
  }

}