import { MigrationInterface, QueryRunner } from 'typeorm';
import { ConfigurationReader } from '../reader/configuration.reader';
import { makeZitadelClient } from '../security/zitadel.client';
import { omit } from 'lodash';

export class AddGeneralInformation1758206595300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const configuration = ConfigurationReader.read();
    const zitadelClient = makeZitadelClient(
      configuration.zitadelApiUrl,
      configuration.zitadelApiToken
    );

    const result = await queryRunner.query(
      `SELECT b."id", oe."organization", "balanceSheet", oe."members" FROM "balance_sheet_entity" b JOIN "organization_entity" oe on oe.id = b."organizationEntityId";`
    );
    // TODO: Handle copied audit balance sheets differently
    for (const { id, organization, members, balanceSheet } of result) {
      console.log(members);
      if (members?.length > 0) {
        try {
          const user = await zitadelClient.getUser(members[0].id);
          const generalInformation = {
            contactPerson: {
              email: user.email,
              name: user.fullName,
            },
            company: {
              name: organization.name,
            },
          };
          await queryRunner.query(
            `UPDATE balance_sheet_entity SET "balanceSheet" = '${JSON.stringify(
              {
                ...balanceSheet,
                generalInformation,
              }
            )}'::jsonb WHERE id = ${id};`
          );
        } catch (error: any) {
          console.log(
            `Error when getting user ${members[0].id}, ${error.message}`
          );
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const result = await queryRunner.query(
      `SELECT "id", "balanceSheet" FROM "balance_sheet_entity";`
    );
    for (const { id, balanceSheet } of result) {
      await queryRunner.query(
        `UPDATE balance_sheet_entity SET "balanceSheet" = '${JSON.stringify(
          omit(balanceSheet, 'generalInformation')
        )}'::jsonb WHERE id = ${id};`
      );
    }
  }
}
