import { Connection } from 'typeorm';
import { User } from '../src/entities/user';
import { Role } from '../src/entities/enums';
import { Application } from 'express';
import supertest from 'supertest';

export class TokenProvider {
  private static async createTestUserIfNotExists(
    connection: Connection,
    email: string,
    password: string,
    role: Role
  ): Promise<void> {
    await connection.manager.transaction(async (entityManager) => {
      const userRepository = entityManager.getRepository(User);
      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        await userRepository.save(new User(undefined, email, password, role));
      }
    });
  }

  private static async provideValidToken(
    app: Application,
    connection: Connection,
    email: string,
    password: string,
    role: Role
  ): Promise<string> {
    const testApp = supertest(app);
    await TokenProvider.createTestUserIfNotExists(
      connection,
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
    connection: Connection,
    email?: string
  ): Promise<string> {
    return await TokenProvider.provideValidToken(
      app,
      connection,
      email || 'user@example.com',
      'MGb3C7WO&=S}Q&R&=4cK',
      Role.User
    );
  }

  public static async provideValidAdminToken(
    app: Application,
    connection: Connection
  ): Promise<string> {
    return await TokenProvider.provideValidToken(
      app,
      connection,
      'admin@example.com',
      '13z2AfZ|V~`?/nQyW0lj',
      Role.Admin
    );
  }
}
