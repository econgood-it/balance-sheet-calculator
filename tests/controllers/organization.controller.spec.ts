import { Connection, Repository } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/configuration.reader';
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import App from '../../src/app';
import { AuthHeader, TokenProvider } from '../TokenProvider';
import supertest from 'supertest';
import {
  ORGANIZATION_RELATIONS,
  OrganizationEntity,
} from '../../src/entities/organization.entity';
import { organizationFactory } from '../../src/openapi/examples';
import { Role } from '../../src/entities/enums';
import { v4 as uuid4 } from 'uuid';

describe('Organization Controller', () => {
  let connection: Connection;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let userTokenHeader: AuthHeader;
  let organizationRepo: Repository<OrganizationEntity>;
  const userEmail = `${uuid4()}@example.com`;

  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        configuration
      );
    app = new App(connection, configuration).app;
    userTokenHeader = await TokenProvider.provideValidAuthHeader(
      app,
      connection,
      Role.User,
      userEmail
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
