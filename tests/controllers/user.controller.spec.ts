import { DataSource, Repository } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/configuration.reader';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import App from '../../src/app';
import { TokenProvider } from '../TokenProvider';
import supertest from 'supertest';
import { User } from '../../src/entities/user';
import { Role } from '../../src/entities/enums';

describe('User Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let userRepository: Repository<User>;
  const newUser = {
    email: 'new@example.com',
    password: "qS-1G,h6:'J=^o(g4W8i",
  };

  const userTokenHeader = {
    key: 'Authorization',
    value: '',
  };

  const adminTokenHeader = {
    key: 'Authorization',
    value: '',
  };

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    app = new App(dataSource, configuration).app;
    userRepository = dataSource.getRepository(User);
    userTokenHeader.value = `Bearer ${await TokenProvider.provideValidUserToken(
      app,
      dataSource
    )}`;
    adminTokenHeader.value = `Bearer ${await TokenProvider.provideValidAdminToken(
      app,
      dataSource
    )}`;
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    const user = await userRepository.findOne({
      where: { email: newUser.email },
    });
    if (user) {
      await userRepository.remove(user);
    }
  });

  it('should allow users to reset their own password', async () => {
    const testApp = supertest(app);
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
    const response = await testApp
      .post('/v1/users')
      .set(userTokenHeader.key, userTokenHeader.value)
      .send({
        email: newUser.email,
        password: newUser.password,
      });
    expect(response.status).toBe(403);
  });

  it('should allow admins to create users', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .post('/v1/users')
      .set(adminTokenHeader.key, adminTokenHeader.value)
      .send({
        email: newUser.email,
        password: newUser.password,
      });
    expect(response.status).toBe(201);
  });

  it('should allow admins to delete users', async () => {
    const testApp = supertest(app);
    const newUser2 = {
      ...newUser,
      email: newUser.email + 2,
    };
    await userRepository.save(
      new User(undefined, newUser2.email, newUser2.password, Role.User)
    );
    expect(
      await userRepository.findOne({ where: { email: newUser2.email } })
    ).toBeDefined();

    const response = await testApp
      .delete('/v1/users')
      .set(adminTokenHeader.key, adminTokenHeader.value)
      .send({
        email: newUser2.email,
      });
    expect(response.status).toBe(200);
    expect(
      await userRepository.findOne({ where: { email: newUser2.email } })
    ).toBeNull();
  });
});
