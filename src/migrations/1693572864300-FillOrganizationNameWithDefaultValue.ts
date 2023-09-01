import { MigrationInterface, QueryRunner } from 'typeorm';

export class FillOrganizationNameWithDefaultValue1693572864300
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const result = await queryRunner.query(
      `SELECT id, "organization" FROM "organization_entity";`
    );
    for (const { id, organization } of result) {
      if (organization.name === undefined || organization.name === '') {
        const organizationJson = {
          ...organization,
          name: `Organization ${id}`,
        };
        await queryRunner.query(
          `UPDATE organization_entity SET "organization" = '${JSON.stringify(
            organizationJson
          )}'::jsonb WHERE id = ${id};`
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
