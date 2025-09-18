import { MigrationInterface, QueryRunner } from 'typeorm';
import { ConfigurationReader } from '../reader/configuration.reader';
import { makeZitadelClient } from '../security/zitadel.client';

export class AddGeneralInformation1758206595300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const configuration = ConfigurationReader.read();
    const zitadelClient = makeZitadelClient(
      configuration.zitadelApiUrl,
      configuration.zitadelApiToken
    );
    const user = await zitadelClient.getUser('335201337820073986');
    console.log(user);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
