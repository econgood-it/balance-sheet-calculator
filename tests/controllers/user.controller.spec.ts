import { DataSource } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/reader/configuration.reader';
import { AuthBuilder } from '../AuthBuilder';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import App from '../../src/app';
import { InMemoryAuthentication } from './in.memory.authentication';
import supertest from 'supertest';
import { UserPaths } from '../../src/controllers/user.controller';
import { makeRepoProvider } from '../../src/repositories/repo.provider';
import { IOrganizationRepo } from '../../src/repositories/organization.repo';
import { makeOrganization } from '../../src/models/organization';

describe('User Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  const authBuilder = new AuthBuilder();
  const auth = authBuilder.addUser();
  const authOtherUser = authBuilder.addUser();
  let orgaRepo: IOrganizationRepo;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    const repoProvider = makeRepoProvider(configuration);
    orgaRepo = repoProvider.getOrganizationRepo(dataSource.manager);
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
    const orga1 = await orgaRepo.save(
      makeOrganization().invite(auth.user.email)
    );
    const orga2 = await orgaRepo.save(
      makeOrganization().rename('Orga2').invite(auth.user.email)
    );

    const response = await testApp
      .get(UserPaths.getInvitation)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { id: orga1.id, name: orga1.name },
      { id: orga2.id, name: orga2.name },
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

  it('should join invited user', async () => {
    const testApp = supertest(app);
    const organization = await orgaRepo.save(
      makeOrganization().invite(auth.user.email)
    );

    const response = await testApp
      .patch(`${UserPaths.getInvitation}/${organization.id}`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value);
    expect(response.status).toBe(200);
    const foundOrga = await orgaRepo.findByIdOrFail(organization.id!);
    expect(foundOrga.members).toEqual([{ id: auth.user.id }]);
    expect(foundOrga.invitations).toEqual([]);
  });

  it('should return 403 if user is not authorized to join', async () => {
    const testApp = supertest(app);
    const organization = await orgaRepo.save(makeOrganization());
    const response = await testApp
      .patch(`${UserPaths.getInvitation}/${organization.id}`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value);
    expect(response.status).toBe(403);
  });
});
