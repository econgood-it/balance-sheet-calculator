import { Connection } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/configuration.reader';
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import App from '../../src/app';
import { TokenProvider } from '../TokenProvider';
import supertest from 'supertest';
import { User } from '../../src/entities/user';

describe('User Controller', () => {
  let connection: Connection;
  let app: Application;
  const configuration = ConfigurationReader.read();

  const userTokenHeader = {
    key: 'Authorization',
    value: '',
  };

  const adminTokenHeader = {
    key: 'Authorization',
    value: '',
  };

  beforeAll(async (done) => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        configuration
      );
    app = new App(connection, configuration).app;
    userTokenHeader.value = `Bearer ${await TokenProvider.provideValidUserToken(
      app,
      connection
    )}`;
    adminTokenHeader.value = `Bearer ${await TokenProvider.provideValidAdminToken(
      app,
      connection
    )}`;
    done();
  });

  afterAll(async (done) => {
    await connection.close();
    done();
  });

  afterEach(async (done) => {
    const repo = connection.getRepository(User);
    const user = await repo.findOne({ email: 'new@example.com' });
    if (user) {
      await repo.remove(user);
    }
    done();
  });

  it('should deny the right to create users for the role User', async (done) => {
    const testApp = supertest(app);
    const response = await testApp
      .post('/v1/users')
      .set(userTokenHeader.key, userTokenHeader.value)
      .send({
        email: 'new@example.com',
        password: 'newpass',
      });
    expect(response.status).toBe(403);
    done();
  });

  it('should allow admins to create users', async (done) => {
    const testApp = supertest(app);
    const response = await testApp
      .post('/v1/users')
      .set(adminTokenHeader.key, adminTokenHeader.value)
      .send({
        email: 'new@example.com',
        password: 'newpass',
      });
    expect(response.status).toBe(201);
    done();
  });
});
