import { DataSource } from 'typeorm';
import { User } from '../src/entities/user';
import { Role } from '../src/entities/enums';
import { Application } from 'express';
import supertest from 'supertest';
import { v4 as uuid4 } from 'uuid';

export type Auth = {
  authHeader: { key: string; value: string };
  email: string;
};

export class AuthBuilder {
  private role: Role = Role.User;
  private email: string = `${uuid4()}-user@example.com`;
  private password: string = `${uuid4()}`;
  constructor(private app: Application, private dataSource: DataSource) {}

  public admin(): AuthBuilder {
    this.role = Role.Admin;
    this.email = `${uuid4()}-admin@example.com`;
    return this;
  }

  public async build(): Promise<Auth> {
    const testApp = supertest(this.app);
    await this.dataSource.manager.transaction(async (entityManager) => {
      const userRepository = entityManager.getRepository(User);
      await userRepository.save(
        new User(undefined, this.email, this.password, this.role)
      );
    });
    const response = await testApp
      .post('/v1/users/token')
      .send({ email: this.email, password: this.password });
    return {
      authHeader: {
        key: 'Authorization',
        value: `Bearer ${response.body.token}`,
      },
      email: this.email,
    };
  }
}
