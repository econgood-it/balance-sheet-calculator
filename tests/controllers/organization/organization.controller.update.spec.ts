import { DataSource } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../../src/reader/configuration.reader';
import App from '../../../src/app';
import { Auth, AuthBuilder } from '../../AuthBuilder';
import supertest, { Response } from 'supertest';
import { organizationFactory } from '../../../src/openapi/examples';
import { OrganizationPaths } from '../../../src/controllers/organization.controller';
import { Organization } from '../../../src/models/organization';
import { RepoProvider } from '../../../src/repositories/repo.provider';
import { DatabaseSourceCreator } from '../../../src/databaseSourceCreator';
import { IOrganizationEntityRepo } from '../../../src/repositories/organization.entity.repo';

describe('Organization Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let organizationRepo: IOrganizationEntityRepo;
  let auth: Auth;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    const repoProvider = new RepoProvider(configuration);
    organizationRepo = repoProvider.getOrganizationEntityRepo(
      dataSource.manager
    );
    app = new App(dataSource, configuration, repoProvider).app;
    auth = await new AuthBuilder(app, dataSource).build();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  async function postOrganization(
    app: supertest.SuperTest<supertest.Test>,
    orgaJson: Organization
  ): Promise<Response> {
    return app
      .post(OrganizationPaths.post)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send(orgaJson);
  }

  it('should update organization on put request', async () => {
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const responsePost = await postOrganization(testApp, orgaJson);
    const orgaJsonUpdate = {
      ...orgaJson,
      address: { ...orgaJson.address, city: 'Example city 2' },
    };
    expect(responsePost.status).toBe(200);
    const response = await testApp
      .put(`${OrganizationPaths.post}/${responsePost.body.id}`)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send(orgaJsonUpdate);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(orgaJsonUpdate);
    const organizationEntity = await organizationRepo.findByIdOrFail(
      response.body.id
    );
    expect(organizationEntity.organization).toMatchObject(orgaJsonUpdate);
    expect(organizationEntity.members).toHaveLength(1);
    expect(organizationEntity.members[0].email).toBe(auth.email);
  });

  it('should fail to update organization if user is unauthenticated', async () => {
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const response = await testApp
      .put(`${OrganizationPaths.post}/9`)
      .set(auth.authHeader.key, 'Bearer invalid token')
      .send(orgaJson);
    expect(response.status).toBe(401);
  });

  it('should fail to update organization if user is admin', async () => {
    const adminAuth = await new AuthBuilder(app, dataSource).admin().build();

    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const responsePost = await postOrganization(testApp, orgaJson);

    const response = await testApp
      .put(`${OrganizationPaths.post}/${responsePost.body.id}`)
      .set(adminAuth.authHeader.key, adminAuth.authHeader.value)
      .send(orgaJson);
    expect(response.status).toBe(403);
  });

  it('should fail to update organization if user is no member of organization', async () => {
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const responsePost = await postOrganization(testApp, orgaJson);

    expect(responsePost.status).toBe(200);
    const authOfUnauhtorizedUser = await new AuthBuilder(
      app,
      dataSource
    ).build();
    const orgaJsonUpdate = {
      ...orgaJson,
      address: { ...orgaJson.address, city: 'Example city 2' },
    };
    const response = await testApp
      .put(`${OrganizationPaths.post}/${responsePost.body.id}`)
      .set(
        authOfUnauhtorizedUser.authHeader.key,
        authOfUnauhtorizedUser.authHeader.value
      )
      .send(orgaJsonUpdate);
    expect(response.status).toBe(403);
  });
});
