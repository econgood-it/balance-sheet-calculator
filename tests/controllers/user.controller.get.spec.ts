import { DataSource } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/reader/configuration.reader';
import { AuthBuilder } from '../AuthBuilder';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import { RepoProvider } from '../../src/repositories/repo.provider';
import App from '../../src/app';
import { InMemoryAuthentication } from './in.memory.authentication';
import supertest from 'supertest';
import { OrganizationBuilder } from '../OrganizationBuilder';
import { UserPaths } from '../../src/controllers/user.controller';

describe('User Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  const authBuilder = new AuthBuilder();
  const auth = authBuilder.addUser();
  const authOtherUser = authBuilder.addUser();

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    const repoProvider = new RepoProvider(configuration);
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

  it('should return invitations of user', async () => {
    const testApp = supertest(app);
    const { organizationEntity: orga1 } = await new OrganizationBuilder()
      .inviteMember(auth.user.email)
      .build(dataSource);
    const { organizationEntity: orga2 } = await new OrganizationBuilder()
      .rename('Orga2')
      .inviteMember(auth.user.email)
      .build(dataSource);
    const response = await testApp
      .get(UserPaths.getInvitation)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { id: orga1.id, name: orga1.organization.name },
      { id: orga2.id, name: orga2.organization.name },
    ]);
  });

  it('should return empty invitations for user', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .get(UserPaths.getInvitation)
      .set(
        authOtherUser.toHeaderPair().key,
        authOtherUser.toHeaderPair().value
      );
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should return 401 if user is not authenticated', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .get(UserPaths.getInvitation)
      .set('Authorization', 'Bearer invalid token')
      .send();
    expect(response.status).toEqual(401);
  });
});
