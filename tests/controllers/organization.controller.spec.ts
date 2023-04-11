import { DataSource, Repository } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/configuration.reader';
import App from '../../src/app';
import { AuthHeader, TokenProvider } from '../TokenProvider';
import supertest, { Response } from 'supertest';
import {
  ORGANIZATION_RELATIONS,
  OrganizationEntity,
} from '../../src/entities/organization.entity';
import { organizationFactory } from '../../src/openapi/examples';
import { Role } from '../../src/entities/enums';
import { v4 as uuid4 } from 'uuid';
import { OrganizationPaths } from '../../src/controllers/organization.controller';
import { Organization } from '../../src/models/organization';
import { RepoProvider } from '../../src/repositories/repo.provider';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';

describe('Organization Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let userTokenHeader: AuthHeader;
  let organizationRepo: Repository<OrganizationEntity>;
  const userEmail = `${uuid4()}@example.com`;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    app = new App(dataSource, configuration, new RepoProvider()).app;
    userTokenHeader = await TokenProvider.provideValidAuthHeader(
      app,
      dataSource,
      Role.User,
      userEmail
    );
    organizationRepo = dataSource.getRepository(OrganizationEntity);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  async function postOrganizationWithNormalUser(
    app: supertest.SuperTest<supertest.Test>,
    orgaJson: Organization
  ): Promise<Response> {
    return app
      .post(OrganizationPaths.post)
      .set(userTokenHeader.key, userTokenHeader.value)
      .send(orgaJson);
  }

  it('should create organization on post request', async () => {
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const response = await postOrganizationWithNormalUser(testApp, orgaJson);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(orgaJson);
    const organizationEntity = await organizationRepo.findOneOrFail({
      where: {
        id: response.body.id,
      },
      relations: ORGANIZATION_RELATIONS,
    });
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

  it('should update organization on put request', async () => {
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const responsePost = await postOrganizationWithNormalUser(
      testApp,
      orgaJson
    );
    const orgaJsonUpdate = {
      ...orgaJson,
      address: { ...orgaJson.address, city: 'Example city 2' },
    };
    expect(responsePost.status).toBe(200);
    const response = await testApp
      .put(`${OrganizationPaths.post}/${responsePost.body.id}`)
      .set(userTokenHeader.key, userTokenHeader.value)
      .send(orgaJsonUpdate);
    console.log(response.text);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(orgaJsonUpdate);
    const organizationEntity = await organizationRepo.findOneOrFail({
      where: {
        id: response.body.id,
      },
      relations: ORGANIZATION_RELATIONS,
    });
    expect(organizationEntity.organization).toMatchObject(orgaJsonUpdate);
    expect(organizationEntity.members).toHaveLength(1);
    expect(organizationEntity.members[0].email).toBe(userEmail);
  });
});
