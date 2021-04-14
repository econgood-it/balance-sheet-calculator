import {MigrationInterface, QueryRunner} from "typeorm";
export class AlterTypeOfDescriptionColumnToJSONB1615971402266 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    const query = `ALTER TABLE "industry_sector" ALTER COLUMN "description" set data type jsonb USING json_build_object('en', description);`
    await queryRunner.query(query);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const query = `ALTER TABLE "industry_sector" ALTER COLUMN "description" set data type character varying USING description::json->>'en';`
    await queryRunner.query(query);
  }

}