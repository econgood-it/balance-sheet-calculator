import { DataSource } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../../src/reader/configuration.reader';
import App from '../../../src/app';
import { Auth, AuthBuilder } from '../../AuthBuilder';
import supertest from 'supertest';
import {
  balanceSheetFactory,
  organizationFactory,
} from '../../../src/openapi/examples';
import { OrganizationPaths } from '../../../src/controllers/organization.controller';
import { RepoProvider } from '../../../src/repositories/repo.provider';
import { DatabaseSourceCreator } from '../../../src/databaseSourceCreator';
import { BalanceSheetEntity } from '../../../src/entities/balance.sheet.entity';

describe('Organization Controller Get Endpoint', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let auth: Auth;
  let authOtherUser: Auth;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    const repoProvider = new RepoProvider(configuration);
    app = new App(dataSource, configuration, repoProvider).app;
    auth = await new AuthBuilder(app, dataSource).build();
    authOtherUser = await new AuthBuilder(app, dataSource).build();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should return organizations of current user', async () => {
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const responseFirstPost = await testApp
      .post(OrganizationPaths.post)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send(orgaJson);
    const responseSecondPost = await testApp
      .post(OrganizationPaths.post)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send(orgaJson);
    const response = await testApp
      .get(OrganizationPaths.getAll)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send(orgaJson);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { id: responseFirstPost.body.id },
      { id: responseSecondPost.body.id },
    ]);
  });
  it('should return organization by id', async () => {
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const responseFirstPost = await testApp
      .post(OrganizationPaths.post)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send(orgaJson);
    const response = await testApp
      .get(`${OrganizationPaths.getAll}/${responseFirstPost.body.id}`)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send(orgaJson);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: responseFirstPost.body.id,
      ...orgaJson,
    });
  });

  it('should block access to organization if user is unauthorized', async () => {
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const responseFirstPost = await testApp
      .post(OrganizationPaths.post)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send(orgaJson);

    const response = await testApp
      .get(`${OrganizationPaths.getAll}/${responseFirstPost.body.id}`)
      .set(authOtherUser.authHeader.key, authOtherUser.authHeader.value)
      .send(orgaJson);
    expect(response.status).toEqual(403);
  });

  it.each([OrganizationPaths.getAll, `${OrganizationPaths.getAll}/9`])(
    'should fail to get organizations if user is unauthenticated',
    async (path: string) => {
      const orgaJson = organizationFactory.default();
      const testApp = supertest(app);
      const response = await testApp
        .get(path)
        .set(auth.authHeader.key, 'Bearer invalid token')
        .send(orgaJson);
      expect(response.status).toBe(401);
    }
  );

  it.each([OrganizationPaths.getAll, `${OrganizationPaths.getAll}/9`])(
    'should fail to get organization if user is admin',
    async (path: string) => {
      const adminAuth = await new AuthBuilder(app, dataSource).admin().build();
      const orgaJson = organizationFactory.default();
      const testApp = supertest(app);

      const response = await testApp
        .get(path)
        .set(adminAuth.authHeader.key, adminAuth.authHeader.value)
        .send(orgaJson);
      expect(response.status).toBe(403);
    }
  );
});

describe('Organization Controller Get Balance Sheets Endpoint', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let auth: Auth;
  let organizationId: number;
  let savedBalanceSheetEntities: BalanceSheetEntity[];

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    const repoProvider = new RepoProvider(configuration);
    app = new App(dataSource, configuration, repoProvider).app;
    auth = await new AuthBuilder(app, dataSource).build();
    const balanceSheetEntityRepo = repoProvider.getBalanceSheetEntityRepo(
      dataSource.manager
    );
    const orgaEnityRepo = repoProvider.getOrganizationEntityRepo(
      dataSource.manager
    );
    const testApp = supertest(app);
    organizationId = (
      await testApp
        .post(OrganizationPaths.post)
        .set(auth.authHeader.key, auth.authHeader.value)
        .send(organizationFactory.default())
    ).body.id;
    const balanceSheetEntities = [
      new BalanceSheetEntity(
        undefined,
        balanceSheetFactory.emptyFullV508(),
        []
      ),
      new BalanceSheetEntity(
        undefined,
        balanceSheetFactory.emptyFullV508(),
        []
      ),
    ];
    savedBalanceSheetEntities = await Promise.all(
      balanceSheetEntities.map(
        async (b) => await balanceSheetEntityRepo.save(b)
      )
    );
    const orgaEntity = await orgaEnityRepo.findByIdOrFail(organizationId);
    for (const balanceSheet of savedBalanceSheetEntities) {
      orgaEntity.addBalanceSheetEntity(balanceSheet);
    }
    await orgaEnityRepo.save(orgaEntity);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should return balance sheets of organization', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .get(`${OrganizationPaths.getAll}/${organizationId}/balancesheet`)
      .set(auth.authHeader.key, auth.authHeader.value);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      savedBalanceSheetEntities.map((b) => ({
        id: b.id,
      }))
    );
  });

  it('should fail for admin users', async () => {
    const testApp = supertest(app);
    const authAdmin = await new AuthBuilder(app, dataSource).admin().build();
    const response = await testApp
      .get(`${OrganizationPaths.getAll}/${organizationId}/balancesheet`)
      .set(authAdmin.authHeader.key, authAdmin.authHeader.value);
    expect(response.status).toBe(403);
  });

  it('should fail if user is not member of organization', async () => {
    const testApp = supertest(app);
    const authNoMember = await new AuthBuilder(app, dataSource).build();
    const response = await testApp
      .get(`${OrganizationPaths.getAll}/${organizationId}/balancesheet`)
      .set(authNoMember.authHeader.key, authNoMember.authHeader.value);
    expect(response.status).toBe(403);
  });
});
