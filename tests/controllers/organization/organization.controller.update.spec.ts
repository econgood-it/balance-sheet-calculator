import { DataSource } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../../src/reader/configuration.reader';
import App from '../../../src/app';
import { AuthBuilder } from '../../AuthBuilder';
import supertest from 'supertest';
import { organizationFactory } from '../../../src/openapi/examples';
import { OrganizationPaths } from '../../../src/controllers/organization.controller';
import { RepoProvider } from '../../../src/repositories/repo.provider';
import { DatabaseSourceCreator } from '../../../src/databaseSourceCreator';
import { IOrganizationEntityRepo } from '../../../src/repositories/organization.entity.repo';
import { InMemoryAuthentication } from '../in.memory.authentication';
import { OrganizationBuilder } from '../../OrganizationBuilder';
import * as _ from 'lodash';

describe('Organization Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let organizationRepo: IOrganizationEntityRepo;
  const authBuilder = new AuthBuilder();
  const auth = authBuilder.addUser();
  const authWithoutOrgaPermissions = authBuilder.addUser();

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    const repoProvider = new RepoProvider(configuration);
    organizationRepo = repoProvider.getOrganizationEntityRepo(
      dataSource.manager
    );
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
    const { organizationEntity } = await new OrganizationBuilder()
      .addMember(auth.user)
      .build(dataSource);
    const orgaJsonUpdate = {
      ..._.omit(organizationEntity.toJson(), 'id'),
      address: {
        ...organizationEntity.toJson().address,
        city: 'Example city 2',
      },
    };
    const response = await testApp
      .put(`${OrganizationPaths.post}/${organizationEntity.id}`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send(orgaJsonUpdate);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(orgaJsonUpdate);
    const organizationEntityFound = await organizationRepo.findByIdOrFail(
      response.body.id
    );
    expect(organizationEntityFound.organization).toMatchObject(orgaJsonUpdate);
    expect(organizationEntityFound.members).toHaveLength(1);
    expect(organizationEntityFound.members[0].id).toBe(auth.user.email);
  });

  it('should fail to update organization if user is unauthenticated', async () => {
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const response = await testApp
      .put(`${OrganizationPaths.post}/9`)
      .set('Authorization', 'Bearer invalid token')
      .send(orgaJson);
    expect(response.status).toBe(401);
  });

  it('should fail to update organization if user is no member of organization', async () => {
    const testApp = supertest(app);
    const { organizationEntity } = await new OrganizationBuilder()
      .addMember(auth.user)
      .build(dataSource);

    const orgaJsonUpdate = {
      ...organizationEntity.toJson(),
      address: {
        ...organizationEntity.toJson().address,
        city: 'Example city 2',
      },
    };
    const response = await testApp
      .put(`${OrganizationPaths.post}/${organizationEntity.id}`)
      .set(
        authWithoutOrgaPermissions.toHeaderPair().key,
        authWithoutOrgaPermissions.toHeaderPair().value
      )
      .send(orgaJsonUpdate);
    expect(response.status).toBe(403);
  });
});
