import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import { DataSource } from 'typeorm';
import { ConfigurationReader } from '../../src/reader/configuration.reader';
import { parseAsUser, User } from '../../src/entities/user';
import { Role } from '../../src/entities/enums';
import {
  IUserEntityRepo,
  UserEntityRepository,
} from '../../src/repositories/user.entity.repo';

describe('UserRepo', () => {
  let userRepository: IUserEntityRepo;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      ConfigurationReader.read()
    );
    userRepository = new UserEntityRepository(dataSource.manager);
  });

  afterAll(async () => {
    await dataSource.destroy();
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
