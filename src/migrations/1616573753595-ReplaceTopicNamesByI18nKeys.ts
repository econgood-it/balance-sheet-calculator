import {MigrationInterface, QueryRunner} from "typeorm";
export class ReplaceTopicNamesByI18nKeys1616573753595 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.replaceTopicNameByI18Keys('v5:compact', 'Compact', queryRunner);
    await this.replaceTopicNameByI18Keys('v5:full', 'Full', queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const query = `ALTER TABLE "industry_sector" ALTER COLUMN "description" set data type character varying USING description::json->>'en';`
    await queryRunner.query(query);
  }

  private async replaceTopicNameByI18Keys(i18nPrefix: string, balanceSheetType: string, queryRunner: QueryRunner) {
    const shortNameToTranslationKeyMap = this.createTranslationMap(i18nPrefix);
    for (let [shortName, translationKey] of shortNameToTranslationKeyMap) {
      await queryRunner.query(this.updateQuery(shortName, translationKey, balanceSheetType));
    }
  }

  private createTranslationMap(i18nPrefix: string) {
    return new Map([
      ['A1', `${i18nPrefix}.A1`],
      ['A2', `${i18nPrefix}.A2`],
      ['A3', `${i18nPrefix}.A3`],
      ['A4', `${i18nPrefix}.A4`],
      ['B1', `${i18nPrefix}.B1`],
      ['B2', `${i18nPrefix}.B2`],
      ['B3', `${i18nPrefix}.B3`],
      ['B4', `${i18nPrefix}.B4`],
      ['C1', `${i18nPrefix}.C1`],
      ['C2', `${i18nPrefix}.C2`],
      ['C3', `${i18nPrefix}.C3`],
      ['C4', `${i18nPrefix}.C4`],
      ['D1', `${i18nPrefix}.D1`],
      ['D2', `${i18nPrefix}.D2`],
      ['D3', `${i18nPrefix}.D3`],
      ['D4', `${i18nPrefix}.D4`],
      ['E1', `${i18nPrefix}.E1`],
      ['E2', `${i18nPrefix}.E2`],
      ['E3', `${i18nPrefix}.E3`],
      ['E4', `${i18nPrefix}.E4`],
    ]);
  }

  private updateQuery(shortName: string, updatedValue: string, balanceSheetType: string): string {
    const from = 'FROM balance_sheet b, rating r';
    const where = `where b.type = '${balanceSheetType}' and b."ratingId" = r.id and topic."ratingId" = r.id and topic."shortName"='${shortName}'`
    return `UPDATE topic SET name='${updatedValue}' ${from} ${where};`;
  }





}