import { DataSource, Repository } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/reader/configuration.reader';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import App from '../../src/app';
import { Auth, AuthBuilder } from '../AuthBuilder';
import supertest from 'supertest';
import { User } from '../../src/entities/user';
import { Role } from '../../src/entities/enums';
import { RepoProvider } from '../../src/repositories/repo.provider';
import { v4 as uuid4 } from 'uuid';

describe('User Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let userRepository: Repository<User>;

  let auth: Auth;

  let adminAuth: Auth;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    app = new App(dataSource, configuration, new RepoProvider(configuration))
      .app;
    userRepository = dataSource.getRepository(User);
    auth = await new AuthBuilder(app, dataSource).build();
    adminAuth = await new AuthBuilder(app, dataSource).admin().build();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });
  function createNewUser() {
    return {
      email: `${uuid4()}@example.com`,
      password: "qS-1G,h6:'J=^o(g4W8i",
    };
  }

  it('should allow users to reset their own password', async () => {
    const testApp = supertest(app);
    const newUser = createNewUser();
    await userRepository.save(
      new User(undefined, newUser.email, newUser.password, Role.User)
    );
    const tokenResponse = await testApp
      .post('/v1/users/token')
      .send({ email: newUser.email, password: newUser.password });
    // Reset password
    const newPassword = newUser.password + '_RESET';
    const response = await testApp
      .post('/v1/users/actions/reset/password')
      .set('Authorization', `Bearer ${tokenResponse.body.token}`)
      .send({
        newPassword,
      });
    expect(response.status).toBe(200);
    const user = await userRepository.findOneOrFail({
      where: {
        email: newUser.email,
      },
    });
    expect(user.comparePassword(newPassword)).toBeTruthy();
  });

  it('should deny the right to create users for the role User', async () => {
    const testApp = supertest(app);
    const newUser = createNewUser();
    const response = await testApp
      .post('/v1/users')
      .set(auth.authHeader.key, auth.authHeader.value)
      .send({
        email: newUser.email,
        password: newUser.password,
      });
    expect(response.status).toBe(403);
  });

  it('should allow admins to create users', async () => {
    const testApp = supertest(app);
    const newUser = createNewUser();
    const response = await testApp
      .post('/v1/users')
      .set(adminAuth.authHeader.key, adminAuth.authHeader.value)
      .send({
        email: newUser.email,
        password: newUser.password,
      });
    expect(response.status).toBe(201);
  });

  it('should allow admins to delete users', async () => {
    const testApp = supertest(app);
    const newUser = createNewUser();

    await userRepository.save(
      new User(undefined, newUser.email, newUser.password, Role.User)
    );
    expect(
      await userRepository.findOne({ where: { email: newUser.email } })
    ).toBeDefined();

    const response = await testApp
      .delete('/v1/users')
      .set(adminAuth.authHeader.key, adminAuth.authHeader.value)
      .send({
        email: newUser.email,
      });
    expect(response.status).toBe(200);
    expect(
      await userRepository.findOne({ where: { email: newUser.email } })
    ).toBeNull();
  });
});
