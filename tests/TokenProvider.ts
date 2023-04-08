import { DataSource } from 'typeorm';
import { User } from '../src/entities/user';
import { Role } from '../src/entities/enums';
import { Application } from 'express';
import supertest from 'supertest';

export type AuthHeader = { key: string; value: string };

export class TokenProvider {
  private static async createTestUserIfNotExists(
    dataSource: DataSource,
    email: string,
    password: string,
    role: Role
  ): Promise<void> {
    await dataSource.manager.transaction(async (entityManager) => {
      const userRepository = entityManager.getRepository(User);
      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        await userRepository.save(new User(undefined, email, password, role));
      }
    });
  }

  private static async provideValidToken(
    app: Application,
    dataSource: DataSource,
    email: string,
    password: string,
    role: Role
  ): Promise<string> {
    const testApp = supertest(app);
    await TokenProvider.createTestUserIfNotExists(
      dataSource,
      email,
      password,
      role
    );
    const response = await testApp
      .post('/v1/users/token')
      .send({ email, password });
    return response.body.token;
  }

  public static async provideValidUserToken(
    app: Application,
    dataSource: DataSource,
    email?: string
  ): Promise<string> {
    return await TokenProvider.provideValidToken(
      app,
      dataSource,
      email || 'user@example.com',
      'MGb3C7WO&=S}Q&R&=4cK',
      Role.User
    );
  }

  public static async provideValidAuthHeader(
    app: Application,
    dataSource: DataSource,
    role: Role = Role.User,
    email?: string
  ): Promise<AuthHeader> {
    const token =
      role === Role.User
        ? await TokenProvider.provideValidUserToken(app, dataSource, email)
        : await TokenProvider.provideValidAdminToken(app, dataSource);
    return {
      key: 'Authorization',
      value: `Bearer ${token}`,
    };
  }

  public static async provideValidAdminToken(
    app: Application,
    dataSource: DataSource
  ): Promise<string> {
    return await TokenProvider.provideValidToken(
      app,
      dataSource,
      'admin@example.com',
      '13z2AfZ|V~`?/nQyW0lj',
      Role.Admin
    );
  }
}
