import { Connection, Repository } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/configuration.reader';
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import App from '../../src/app';
import { AuthHeader, TokenProvider } from '../TokenProvider';
import supertest from 'supertest';
import { OrganizationEntity } from '../../src/entities/organization.entity';
import { organizationFactory } from '../../src/openapi/examples';
import { Role } from '../../src/entities/enums';

describe('Organization Controller', () => {
  let connection: Connection;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let userTokenHeader: AuthHeader;
  let organizationRepo: Repository<OrganizationEntity>;

  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        configuration
      );
    app = new App(connection, configuration).app;
    userTokenHeader = await TokenProvider.provideValidAuthHeader(
      app,
      connection
    );
    organizationRepo = connection.getRepository(OrganizationEntity);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should create organization on post request', async () => {
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const response = await testApp
      .post('/v1/organization')
      .set(userTokenHeader.key, userTokenHeader.value)
      .send(orgaJson);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(orgaJson);
    const organization = (
      await organizationRepo.findOneByOrFail({
        id: response.body.id,
      })
    ).organization;
    expect(organization).toMatchObject(orgaJson);
  });

  it('should fail to create organization if user is unauthenticated', async () => {
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const response = await testApp
      .post('/v1/organization')
      .set(userTokenHeader.key, 'Bearer invalid token')
      .send(orgaJson);
    expect(response.status).toBe(401);
  });

  it('should fail to create organization if user is admin', async () => {
    const adminTokenHeader = await TokenProvider.provideValidAuthHeader(
      app,
      connection,
      Role.Admin
    );
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const response = await testApp
      .post('/v1/organization')
      .set(adminTokenHeader.key, adminTokenHeader.value)
      .send(orgaJson);
    expect(response.status).toBe(403);
  });
});
