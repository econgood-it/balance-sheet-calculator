import { Application } from 'express';
import supertest from 'supertest';
import { DataSource } from 'typeorm';
import App from '../../../src/app';
import { OrganizationPaths } from '../../../src/controllers/organization.controller';
import { DatabaseSourceCreator } from '../../../src/databaseSourceCreator';
import { ConfigurationReader } from '../../../src/reader/configuration.reader';
import { AuthBuilder } from '../../AuthBuilder';
import { InMemoryAuthentication } from '../in.memory.authentication';
import { makeRepoProvider } from '../../../src/repositories/repo.provider';
import { IOrganizationRepo } from '../../../src/repositories/organization.repo';
import { makeOrganization } from '../../../src/models/organization';

describe('Organization Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let organizationRepo: IOrganizationRepo;
  const authBuilder = new AuthBuilder();
  const auth = authBuilder.addUser();
  const authWithoutOrgaPermissions = authBuilder.addUser();
  const orgaJsonUpdate = {
    name: 'New name',
    address: {
      city: 'New city 2',
      houseNumber: 'New 42',
      street: 'New street',
      zip: '100100',
    },
  };

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    const repoProvider = makeRepoProvider(configuration);
    organizationRepo = repoProvider.getOrganizationRepo(dataSource.manager);
    app = new App(
      dataSource,
      configuration,
      repoProvider,
      new InMemoryAuthentication(authBuilder.getTokenMap())
    ).app;
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should update organization on put request', async () => {
    const testApp = supertest(app);
    const organization = await organizationRepo.save(
      makeOrganization().withFields({
        members: [{ id: auth.user.id }],
      })
    );

    const response = await testApp
      .put(`${OrganizationPaths.post}/${organization.id}`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send(orgaJsonUpdate);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ...orgaJsonUpdate,
      id: organization.id,
      invitations: [],
    });
    const organizationFound = await organizationRepo.findByIdOrFail(
      response.body.id
    );
    expect(organizationFound).toMatchObject(orgaJsonUpdate);
    expect(organizationFound.members).toEqual([{ id: auth.user.id }]);
  });

  it('should fail to update organization if user is unauthenticated', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .put(`${OrganizationPaths.post}/9`)
      .set('Authorization', 'Bearer invalid token')
      .send(orgaJsonUpdate);
    expect(response.status).toBe(401);
  });

  it('should fail to update organization if user is no member of organization', async () => {
    const testApp = supertest(app);
    const organization = await organizationRepo.save(
      makeOrganization().withFields({
        members: [{ id: auth.user.id }],
      })
    );

    const response = await testApp
      .put(`${OrganizationPaths.post}/${organization.id}`)
      .set(
        authWithoutOrgaPermissions.toHeaderPair().key,
        authWithoutOrgaPermissions.toHeaderPair().value
      )
      .send(orgaJsonUpdate);
    expect(response.status).toBe(403);
  });
});
