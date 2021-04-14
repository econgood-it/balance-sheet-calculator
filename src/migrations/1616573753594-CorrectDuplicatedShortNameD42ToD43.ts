import {MigrationInterface, QueryRunner} from "typeorm";
export class CorrectDuplicatedShortNameD42ToD431616573753594 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(this.updateQuery('D4.3'));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(this.updateQuery('D4.2'));
  }


  private updateQuery(newShortName: string): string {
    const from = 'FROM balance_sheet b, rating r, topic t';
    const nameOfWrongD42 = 'Negative aspect: non-disclosure of hazardous substances';
    const where = `where b.type = 'Full' and b."ratingId" = r.id and t."ratingId" = r.id and t.id = aspect."topicId" and aspect.name='${nameOfWrongD42}'`
    return `UPDATE aspect SET "shortName"='${newShortName}' ${from} ${where};`;
  }

}