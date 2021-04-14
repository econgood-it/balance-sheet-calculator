import {MigrationInterface, QueryRunner} from "typeorm";
export class ReplaceTopicNamesByI18nKeys1616573753595 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.replaceTopicNameByI18Keys('v5:compact', 'Compact', queryRunner);
    await this.replaceTopicNameByI18Keys('v5:full', 'Full', queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const shortNameToOldName = new Map<string, string>([
      ['A1', 'Human dignity in the supply chain'],
      ['A2', 'Solidarity and social justice in the supply chain'],
      ['A3', 'Environmental sustainability in the supply chain'],
      ['A4', 'Transparency & co-determination in the supply chain'],
      ['B1', 'Ethical position in relation to financial resources'],
      ['B2', 'Social position in relation to financial resources'],
      ['B3', 'Use of funds in relation to social and environmental impacts'],
      ['B4', 'Ownership and co-determination'],
      ['C1', 'Human dignity in the workplace and working environment'],
      ['C2', 'Self-determined working arrangements'],
      ['C3', 'Environmentally-friendly behaviour of staff'],
      ['C4', 'Co-determination and transparency within the organisation'],
      ['D1', 'Ethical customer relations'],
      ['D2', 'Cooperation and solidarity with other companies'],
      ['D3', 'Impact on the environment of the use and disposal of products and service'],
      ['D4', 'Customer participation and product transparency'],
      ['E1', 'Purpose of products and services and their effects on society'],
      ['E2', 'Contribution to the community'],
      ['E3', 'Reduction of environmental impact'],
      ['E4', 'Social co-determination and transparency'],
    ]);
    for (const [shortName, oldName] of shortNameToOldName) {
      await queryRunner.query(this.rollbackName(shortName, oldName));
    }

  }


  private rollbackName(shortName: string, oldName: string,) {
    const from = 'FROM balance_sheet b, rating r';
    const where = `where topic."shortName"='${shortName}'`
    return `UPDATE topic SET name='${oldName}' ${from} ${where};`;
  }

  private async replaceTopicNameByI18Keys(i18nPrefix: string, balanceSheetType: string, queryRunner: QueryRunner) {
    await queryRunner.query(this.updateQuery(i18nPrefix, balanceSheetType));
  }

  private updateQuery(i18nPrefix: string, balanceSheetType: string): string {
    const from = 'FROM balance_sheet b, rating r';
    const where = `where b.type = '${balanceSheetType}' and b."ratingId" = r.id and topic."ratingId" = r.id`
    return `UPDATE topic SET name=concat('${i18nPrefix}.', topic."shortName") ${from} ${where};`;
  }

}