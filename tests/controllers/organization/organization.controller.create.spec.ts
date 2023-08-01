import { DataSource } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../../src/reader/configuration.reader';
import App from '../../../src/app';
import { Auth, AuthBuilder } from '../../AuthBuilder';
import supertest from 'supertest';
import {
  balanceSheetFactory,
  balanceSheetJsonFactory,
  organizationFactory,
} from '../../../src/openapi/examples';
import { OrganizationPaths } from '../../../src/controllers/organization.controller';
import { RepoProvider } from '../../../src/repositories/repo.provider';
import { DatabaseSourceCreator } from '../../../src/databaseSourceCreator';
import { IOrganizationEntityRepo } from '../../../src/repositories/organization.entity.repo';
import { BalanceSheetEntity } from '../../../src/entities/balance.sheet.entity';

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

describe('Organization Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let organizationRepo: IOrganizationEntityRepo;
  let auth: Auth;
  let organizationId: number;

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
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    organizationId = (
      await testApp
        .post(OrganizationPaths.post)
        .set(auth.authHeader.key, auth.authHeader.value)
        .send(orgaJson)
    ).body.id;
  });

  afterAll(async () => {
    await dataSource.destroy();
  });
  it('should create balance sheets for organization', async () => {
    const balanceSheet = balanceSheetJsonFactory.emptyFullV508();
    const testApp = supertest(app);
    const response = await testApp
      .post(`${OrganizationPaths.getAll}/${organizationId}/balancesheet`)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send(balanceSheet);
    expect(response.status).toBe(200);
    const balanceSheetEntity = new BalanceSheetEntity(
      response.body.id,
      balanceSheetFactory.emptyFullV508(),
      []
    );
    await balanceSheetEntity.reCalculate();
    expect(response.body).toMatchObject(balanceSheetEntity.toJson('en'));
    const response2 = await testApp
      .post(`${OrganizationPaths.getAll}/${organizationId}/balancesheet`)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send(balanceSheet);
    const organizationEntity = await organizationRepo.findByIdOrFail(
      organizationId,
      true
    );
    expect(organizationEntity.balanceSheetEntities?.map((b) => b.id)).toEqual([
      response.body.id,
      response2.body.id,
    ]);
  });

  it('balance sheet creation should fail if user is not member of organization', async () => {
    const balanceSheet = balanceSheetJsonFactory.emptyFullV508();
    const testApp = supertest(app);
    const authNoMember = await new AuthBuilder(app, dataSource).build();
    const response = await testApp
      .post(`${OrganizationPaths.getAll}/${organizationId}/balancesheet`)
      .set(authNoMember.authHeader.key, authNoMember.authHeader.value)
      .send(balanceSheet);
    expect(response.status).toEqual(403);
  });

  it('should fail to create balance sheet if user is admin', async () => {
    const balanceSheet = balanceSheetJsonFactory.emptyFullV508();
    const testApp = supertest(app);
    const adminAuth = await new AuthBuilder(app, dataSource).admin().build();
    const response = await testApp
      .post(`${OrganizationPaths.getAll}/${organizationId}/balancesheet`)
      .set(adminAuth.authHeader.key, adminAuth.authHeader.value)
      .send(balanceSheet);
    expect(response.status).toEqual(403);
  });
});
