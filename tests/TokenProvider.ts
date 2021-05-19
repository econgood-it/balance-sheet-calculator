import { Connection } from 'typeorm';
import { User } from '../src/entities/user';
import { Role } from '../src/entities/enums';
import { Application } from 'express';
import supertest from 'supertest';

export class TokenProvider {
  private static async createTestUserIfNotExists(
    connection: Connection,
    email: string,
    password: string
  ): Promise<void> {
    await connection.manager.transaction(async (entityManager) => {
      const userRepository = entityManager.getRepository(User);
      const user = await userRepository.findOne({ email: email });
      if (!user) {
        await userRepository.save(
          new User(undefined, email, password, Role.User)
        );
      }
    });
  }

  public static async provideValidToken(
    app: Application,
    connection: Connection
  ): Promise<string> {
    const testApp = supertest(app);
    const email = 'user@example.com';
    const password = 'mysecret';
    await TokenProvider.createTestUserIfNotExists(connection, email, password);
    const response = await testApp
      .post('/v1/users/token')
      .send({ email: email, password: password });
    return response.body.token;
  }
}
