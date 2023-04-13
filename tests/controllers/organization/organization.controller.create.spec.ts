import { DataSource } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../../src/configuration.reader';
import App from '../../../src/app';
import { AuthHeader, TokenProvider } from '../../TokenProvider';
import supertest, { Response } from 'supertest';
import { organizationFactory } from '../../../src/openapi/examples';
import { Role } from '../../../src/entities/enums';
import { v4 as uuid4 } from 'uuid';
import { OrganizationPaths } from '../../../src/controllers/organization.controller';
import { Organization } from '../../../src/models/organization';
import { RepoProvider } from '../../../src/repositories/repo.provider';
import { DatabaseSourceCreator } from '../../../src/databaseSourceCreator';
import { IOrganizationEntityRepo } from '../../../src/repositories/organization.entity.repo';

describe('Organization Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let userTokenHeader: AuthHeader;
  let organizationRepo: IOrganizationEntityRepo;
  const userEmail = `${uuid4()}@example.com`;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    const repoProvider = new RepoProvider();
    organizationRepo = repoProvider.getOrganizationEntityRepo(
      dataSource.manager
    );
    app = new App(dataSource, configuration, repoProvider).app;
    userTokenHeader = await TokenProvider.provideValidAuthHeader(
      app,
      dataSource,
      Role.User,
      userEmail
    );
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should create organization on post request', async () => {
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const response = await testApp
      .post(OrganizationPaths.post)
      .set(userTokenHeader.key, userTokenHeader.value)
      .send(orgaJson);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(orgaJson);
    const organizationEntity = await organizationRepo.findByIdOrFail(
      response.body.id
    );
    expect(organizationEntity.organization).toMatchObject(orgaJson);
    expect(organizationEntity.members).toHaveLength(1);
    expect(organizationEntity.members[0].email).toBe(userEmail);
  });

  it('should fail to create organization if user is unauthenticated', async () => {
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const response = await testApp
      .post(OrganizationPaths.post)
      .set(userTokenHeader.key, 'Bearer invalid token')
      .send(orgaJson);
    expect(response.status).toBe(401);
  });

  it('should fail to create organization if user is admin', async () => {
    const adminTokenHeader = await TokenProvider.provideValidAuthHeader(
      app,
      dataSource,
      Role.Admin
    );
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const response = await testApp
      .post(OrganizationPaths.post)
      .set(adminTokenHeader.key, adminTokenHeader.value)
      .send(orgaJson);
    expect(response.status).toBe(403);
  });
});
