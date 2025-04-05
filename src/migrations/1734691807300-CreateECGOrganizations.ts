import { MigrationInterface, QueryRunner } from 'typeorm';
import * as dotenv from 'dotenv';
import { CertificationAuthorityNames } from '@ecogood/e-calculator-schemas/dist/audit.dto';

// Load the environment variables
dotenv.config();
export class CreateECGOrganizations1734691807300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const address = {
      city: 'Hamburg',
      houseNumber: '23',
      street: 'Stresemannstr.',
      zip: '22769',
    };
    const organizations = [
      {
        name: CertificationAuthorityNames.AUDIT,
        members: [
          { id: process.env.ECG_AUDIT_ADMIN_ID },
          { id: process.env.ECG_AUDIT_API_USER_ID },
        ],
      },
      {
        name: CertificationAuthorityNames.PEER_GROUP,
        members: [
          { id: process.env.ECG_PEER_GROUP_ADMIN_ID },
          { id: process.env.ECG_AUDIT_API_USER_ID },
        ],
      },
    ];
    for (const { name, members } of organizations) {
      const result = await queryRunner.query(
        `INSERT INTO organization_entity (organization, members)
         VALUES ('${JSON.stringify({
           name,
           address,
           invitations: [],
         })}'::jsonb, '${JSON.stringify(members)}'::jsonb)
         RETURNING id;`
      );
      await queryRunner.query(
        `INSERT INTO certification_authority_entity (name, "organizationEntityId")
         VALUES ('${name}', ${result[0].id});`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
