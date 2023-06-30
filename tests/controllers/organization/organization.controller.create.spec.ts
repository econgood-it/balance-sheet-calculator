import { DataSource } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../../src/reader/configuration.reader';
import App from '../../../src/app';
import { Auth, AuthBuilder } from '../../AuthBuilder';
import supertest from 'supertest';
import { organizationFactory } from '../../../src/openapi/examples';
import { OrganizationPaths } from '../../../src/controllers/organization.controller';
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

  it('should create organization on post request', async () => {
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const response = await testApp
      .post(OrganizationPaths.post)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send(orgaJson);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(orgaJson);
    const organizationEntity = await organizationRepo.findByIdOrFail(
      response.body.id
    );
    expect(organizationEntity.organization).toMatchObject(orgaJson);
    expect(organizationEntity.members).toHaveLength(1);
    expect(organizationEntity.members[0].email).toBe(auth.email);
  });

  it('should fail to create organization if user is unauthenticated', async () => {
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const response = await testApp
      .post(OrganizationPaths.post)
      .set(auth.authHeader.key, 'Bearer invalid token')
      .send(orgaJson);
    expect(response.status).toBe(401);
  });

  it('should fail to create organization if user is admin', async () => {
    const adminAuth = await new AuthBuilder(app, dataSource).admin().build();
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const response = await testApp
      .post(OrganizationPaths.post)
      .set(adminAuth.authHeader.key, adminAuth.authHeader.value)
      .send(orgaJson);
    expect(response.status).toBe(403);
  });
});
