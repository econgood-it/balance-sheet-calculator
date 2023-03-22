import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { Connection, Repository } from 'typeorm';
import { ConfigurationReader } from '../../src/configuration.reader';
import { parseAsUser, User } from '../../src/entities/user';
import { Role } from '../../src/entities/enums';

describe('User', () => {
  let userRepository: Repository<User>;
  let connection: Connection;

  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        ConfigurationReader.read()
      );
    userRepository = connection.getRepository(User);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should be saved and deleted', async () => {
    const user: User = new User(
      undefined,
      'mr@ecogood.org',
      'takecare',
      Role.User
    );
    const result = await userRepository.save(user);
    expect(result.email).toBe('mr@ecogood.org');
    expect(result.password).not.toBe('takecare');
    expect(result.role).toBe(Role.User);
    expect(result.comparePassword('takecare')).toBeTruthy();
    await userRepository.remove(result);
  });
});

it('Parse json as user', () => {
  const json = {
    email: 'email@example.com',
    password: 'amazingsecreturieojqfiejqiofjeqiojfoiqwej',
  };
  const user = parseAsUser(json);
  expect(user.email).toBe(json.email);
  expect(user.password).toBe(json.password);
  expect(user.role).toBe(Role.User);
});
