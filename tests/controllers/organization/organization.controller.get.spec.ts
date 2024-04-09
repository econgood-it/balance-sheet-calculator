import { DataSource } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../../src/reader/configuration.reader';
import App from '../../../src/app';
import { AuthBuilder } from '../../AuthBuilder';
import supertest from 'supertest';
import { OrganizationPaths } from '../../../src/controllers/organization.controller';
import { OldRepoProvider } from '../../../src/repositories/oldRepoProvider';
import { DatabaseSourceCreator } from '../../../src/databaseSourceCreator';
import { OrganizationBuilder } from '../../OrganizationBuilder';
import { InMemoryAuthentication } from '../in.memory.authentication';
import { makeRepoProvider } from '../../../src/repositories/repo.provider';
import { IOrganizationRepo } from '../../../src/repositories/organization.repo';
import { makeOrganization } from '../../../src/models/organization';
import { OrganizationResponseSchema } from '@ecogood/e-calculator-schemas/dist/organization.dto';

describe('Organization Controller Get Endpoint', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  const authBuilder = new AuthBuilder();
  const auth = authBuilder.addUser();
  const authWithoutOrgaPermissions = authBuilder.addUser();
  let organizationRepo: IOrganizationRepo;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    const repoProvider = makeRepoProvider(configuration);
    organizationRepo = repoProvider.getOrganizationRepo(dataSource.manager);
    const oldRepoProvider = new OldRepoProvider(configuration);
    app = new App(
      dataSource,
      configuration,
      repoProvider,
      oldRepoProvider,
      new InMemoryAuthentication(authBuilder.getTokenMap())
    ).app;
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should return organizations of current user', async () => {
    const testApp = supertest(app);
    const member = { id: auth.user.id };
    const organization1 = await organizationRepo.save(
      makeOrganization().withFields({
        members: [member],
      })
    );
    const organization2 = await organizationRepo.save(
      makeOrganization().withFields({
        name: 'Test organization 2',
        members: [member],
      })
    );

    const response = await testApp
      .get(OrganizationPaths.getAll)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { id: organization1.id, name: organization1.name },
      { id: organization2.id, name: organization2.name },
    ]);
  });
  it('should return organization by id', async () => {
    const testApp = supertest(app);
    const organization = await organizationRepo.save(
      makeOrganization().withFields({
        members: [{ id: auth.user.id }],
      })
    );
    const response = await testApp
      .get(`${OrganizationPaths.getAll}/${organization.id}`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send();
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      OrganizationResponseSchema.parse(organization)
    );
  });

  it('should block access to organization if user is unauthorized', async () => {
    const testApp = supertest(app);
    const organization = await organizationRepo.save(
      makeOrganization().withFields({
        members: [{ id: auth.user.id }],
      })
    );

    const response = await testApp
      .get(`${OrganizationPaths.getAll}/${organization.id}`)
      .set(
        authWithoutOrgaPermissions.toHeaderPair().key,
        authWithoutOrgaPermissions.toHeaderPair().value
      )
      .send();
    expect(response.status).toEqual(403);
  });

  it.each([OrganizationPaths.getAll, `${OrganizationPaths.getAll}/9`])(
    'should fail to get organizations if user is unauthenticated',
    async (path: string) => {
      const testApp = supertest(app);
      const response = await testApp
        .get(path)
        .set('Authorization', 'Bearer invalid token')
        .send();
      expect(response.status).toBe(401);
    }
  );
});

describe('Organization Controller Get Balance Sheets Endpoint', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();

  const authBuilder = new AuthBuilder();
  const auth = authBuilder.addUser();
  const authWithoutOrgaPermissions = authBuilder.addUser();

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    const repoProvider = new OldRepoProvider(configuration);
    app = new App(
      dataSource,
      configuration,
      makeRepoProvider(configuration),
      repoProvider,
      new InMemoryAuthentication(authBuilder.getTokenMap())
    ).app;
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should return balance sheets of organization', async () => {
    const testApp = supertest(app);
    const { organizationEntity } = await new OrganizationBuilder()
      .addMember(auth.user)
      .addBalanceSheetEntity()
      .addBalanceSheetEntity()
      .build(dataSource);
    const response = await testApp
      .get(`${OrganizationPaths.getAll}/${organizationEntity.id}/balancesheet`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      organizationEntity.balanceSheetEntities?.map((b) => ({
        id: b.id,
      }))
    );
  });

  it('should fail if user is not member of organization', async () => {
    const testApp = supertest(app);
    const { organizationEntity } = await new OrganizationBuilder()
      .addMember(auth.user)
      .addBalanceSheetEntity()
      .addBalanceSheetEntity()
      .build(dataSource);

    const response = await testApp
      .get(`${OrganizationPaths.getAll}/${organizationEntity.id}/balancesheet`)
      .set(
        authWithoutOrgaPermissions.toHeaderPair().key,
        authWithoutOrgaPermissions.toHeaderPair().value
      );
    expect(response.status).toBe(403);
  });
});
