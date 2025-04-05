import { DataSource } from 'typeorm';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import { ConfigurationReader } from '../../src/reader/configuration.reader';
import {
  ICertificationAuthorityRepo,
  makeCertificationAuthorityRepo,
} from '../../src/repositories/certification.authority.repo';
import { CertificationAuthorityNames } from '@ecogood/e-calculator-schemas/dist/audit.dto';

describe('CertificationAuthorityRepo', () => {
  let certificationAuthorityRepo: ICertificationAuthorityRepo;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      ConfigurationReader.read()
    );
    certificationAuthorityRepo = makeCertificationAuthorityRepo(
      dataSource.manager
    );
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('get CertificationAuthority', async () => {
    let certificationAuthority = await certificationAuthorityRepo.findByName(
      CertificationAuthorityNames.AUDIT
    );
    expect(certificationAuthority.name).toEqual(
      CertificationAuthorityNames.AUDIT
    );
    expect(certificationAuthority.organizationId).toEqual(expect.any(Number));

    certificationAuthority = await certificationAuthorityRepo.findByName(
      CertificationAuthorityNames.PEER_GROUP
    );
    expect(certificationAuthority.name).toEqual(
      CertificationAuthorityNames.PEER_GROUP
    );
    expect(certificationAuthority.organizationId).toEqual(expect.any(Number));
  });
});
