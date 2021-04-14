import {MigrationInterface, QueryRunner} from "typeorm";

export class ReplaceAspectNamesByI18nKeys1616588129420 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.replaceAspectNamesByI18Keys('v5:compact', 'Compact', queryRunner);
    await this.replaceAspectNamesByI18Keys('v5:full', 'Full', queryRunner);
  }

  private async replaceAspectNamesByI18Keys(i18nPrefix: string, balanceSheetType: string, queryRunner: QueryRunner) {
    await queryRunner.query(this.updateQuery(i18nPrefix, balanceSheetType));
  }

  private updateQuery(i18nPrefix: string, balanceSheetType: string): string {
    const from = 'FROM balance_sheet b, rating r, topic t';
    const where = `where b.type = '${balanceSheetType}' and b."ratingId" = r.id and t."ratingId" = r.id and t.id = aspect."topicId"`
    return `UPDATE aspect SET name=concat('${i18nPrefix}.', replace(aspect."shortName", '.', '')) ${from} ${where};`;
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const shortNameToOldNameCompact = new Map<string, string>([
      ['A1.1', 'Human dignity in the supply chain'],
      ['A1.2', 'Negative aspect: violation of human dignity in the supply chain'],
      ['A2.1', 'Solidarity and social justice in the supply chain'],
      ['A2.2', 'Negative aspect: abuse of market power against suppliers'],
      ['A3.1', 'Environmental sustainability in the supply chain'],
      ['A3.2', 'Negative aspect: disproportionate environmental impact throughout the supply chain'],
      ['A4.1', 'Transparency & co-determination in the supply chain'],
      ['B1.1', 'Ethical position in relation to financial resources'],
      ['B2.1', 'Social position in relation to financial resources'],
      ['B2.2', 'Negative aspect: unfair distribution of funds'],
      ['B3.1', 'Use of funds in relation to social and environmental impacts'],
      ['B3.2', 'Negative aspect: reliance on environmentally unsafe resources'],
      ['B4.1', 'Ownership and co-determination'],
      ['B4.2', 'Negative aspect: hostile takeover'],
      ['C1.1', 'Human dignity in the workplace and working environment'],
      ['C1.2', 'Negative aspect: unfit working conditions'],
      ['C2.1', 'Self-determined working arrangements'],
      ['C2.2', 'Negative aspect: unfair employment contracts'],
      ['C3.1', 'Environmentally-friendly behaviour of staff'],
      ['C3.2', 'Negative aspect: guidance on waste/ environmentally damaging practices'],
      ['C4.1', 'Co-determination and transparency within the organisation'],
      ['C4.2', 'Negative aspect: obstruction of works councils'],
      ['D1.1', 'Ethical customer relations'],
      ['D1.2', 'Negative aspect: unethical advertising'],
      ['D2.1', 'Cooperation and solidarity with other companies'],
      ['D2.2', 'Negative aspect: abuse of market power to the detriment of other companies'],
      ['D3.1', 'Impact on the environment of the use and disposal of products and services'],
      ['D3.2', 'Negative aspect: wilful disregard of disproportionate environmental impacts'],
      ['D4.1', 'Customer participation and product transparency'],
      ['D4.2', 'Negative aspect: non-disclosure of hazardous substances'],
      ['E1.1', 'Purpose of products and services and their effects on society'],
      ['E1.2', 'Negative aspect: unethical and unfit products and services'],
      ['E2.1', 'Contribution to the community'],
      ['E2.2', 'Negative aspect: inappropriate non-payment of tax'],
      ['E2.3', 'Negative aspect: no anti-corruption policy'],
      ['E3.1', 'Reduction of environmental impact'],
      ['E3.2', 'Negative aspect: infringement of environmental regulations and disproportionate environmental pollution'],
      ['E4.1', 'Social co-determination and transparency'],
      ['E4.2', 'Negative aspect: lack of transparency and wilful misinformation'],
    ]);
    for (const [shortName, oldName] of shortNameToOldNameCompact) {
      await queryRunner.query(this.rollbackName(shortName, oldName, 'Compact'));
    }

    const shortNameToOldNameFull = new Map<string, string>([
      ['A1.1','Working conditions and social impact in the supply chain'],
      ['A1.2','Negative aspect: violation of human dignity in the supply chain'],
      ['A2.1','Fair business practices towards direct suppliers'],
      ['A2.2','Exercising a positive influence on solidarity and social justice in the supply chain'],
      ['A2.3','Negative aspect: abuse of market power against suppliers'],
      ['A3.1','Environmental impact throughout the supply chain'],
      ['A3.2','Negative aspect: disproportionate environmental impact throughout the supply chain'],
      ['A4.1','Transparency towards suppliers and their right to co-determination'],
      ['A4.2','Positive influence on transparency and co-determination throughout the supply chain'],
      ['B1.1','Financial independence through equity financing'],
      ['B1.2','Common Good-orientated borrowing'],
      ['B1.3','Ethical position of external financial partners'],
      ['B2.1','Solidarity and Common Good-orientated use of funds'],
      ['B2.2','Negative aspect: unfair distribution of funds'],
      ['B3.1','Environmental quality of investments'],
      ['B3.2','Common Good-orientated investment'],
      ['B3.3','Negative aspect: reliance on environmentally unsafe resources'],
      ['B4.1','Common Good-orientated ownership structure'],
      ['B4.2','Negative aspect: hostile takeover'],
      ['C1.1','Employee-focused organisational culture'],
      ['C1.2','Health promotion and occupational health and safety'],
      ['C1.3','Diversity and equal opportunities'],
      ['C1.4','Negative aspect: unfit working conditions'],
      ['C2.1','Pay structure'],
      ['C2.2','Structuring working time'],
      ['C2.3','Employment structure and work-life balance'],
      ['C2.4','Negative aspect: unfair employment contracts'],
      ['C3.1','Food during working hours'],
      ['C3.2','Travel to work'],
      ['C3.3','Organisational culture, cultivating awareness for an environmentally-friendly approach'],
      ['C3.4','Negative aspect: guidance on waste/ environmentally damaging practices'],
      ['C4.1','Transparency within the organisation'],
      ['C4.2','Legitimation of the management'],
      ['C4.3','Employee co-determination'],
      ['C4.4','Negative aspect: obstruction of works councils'],
      ['D1.1','Respect for human dignity in communication with customers'],
      ['D1.2','Barrier-free access'],
      ['D1.3','Negative aspect: unethical advertising'],
      ['D2.1','Cooperation with other companies'],
      ['D2.2','Solidarity with other companies'],
      ['D2.3','Negative aspect: abuse of market power to the detriment of other companies'],
      ['D3.1','Environmental cost-benefit ration of products and services (efficiency and consistency) '],
      ['D3.2','Moderate use of products and services (sufficiency)'],
      ['D3.3','Negative aspect: wilful disregard of disproportionate environmental impacts'],
      ['D4.1','Customer participation, joint product development and market research'],
      ['D4.2','Product transparency'],
      ['D4.3','Negative aspect: non-disclosure of hazardous substances'],
      ['E1.1','Products and services should cover basic needs and contribute to a good life'],
      ['E1.2','Social impact of products and services'],
      ['E1.3','Negative aspect: unethical and unfit products and services'],
      ['E2.1','Taxes and social security contributions'],
      ['E2.2','Voluntary contributions that strengthen society'],
      ['E2.3','Negative aspect: inappropriate non-payment of tax'],
      ['E2.4','Negative aspect: no anti-corruption policy'],
      ['E3.1','Absolute impact and management strategy'],
      ['E3.2','Relative impact'],
      ['E3.3','Negative aspect: infringement of environmental regulations and disproportionate environmental pollution'],
      ['E4.1','Transparency'],
      ['E4.2','Social participation'],
      ['E4.3','Negative aspect: lack of transparency and wilful misinformation'],
    ])

    for (const [shortName, oldName] of shortNameToOldNameFull) {
      await queryRunner.query(this.rollbackName(shortName, oldName, 'Full'));
    }
  }

  private rollbackName(shortName: string, oldName: string, balanceSheetType: string): string {
    const from = 'FROM balance_sheet b, rating r, topic t';
    const where = `where b.type = '${balanceSheetType}' and b."ratingId" = r.id and t."ratingId" = r.id and t.id = aspect."topicId" and aspect."shortName"='${shortName}'`
    return `UPDATE aspect SET name='${oldName}' ${from} ${where};`;
  }



}