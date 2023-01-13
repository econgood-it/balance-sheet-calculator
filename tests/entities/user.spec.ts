import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { Connection, Repository } from 'typeorm';
import { ConfigurationReader } from '../../src/configuration.reader';
import { User } from '../../src/entities/user';
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

  it('should be saved with apiKeys', async () => {
    let user: User = new User(
      undefined,
      'mr@ecogood.org',
      'takecare',
      Role.User
    );
    user.addApiKey();
    user.addApiKey();
    user.addApiKey();
    const expected = user.getApiKeys();
    await userRepository.save(user);
    user = await userRepository.findOneOrFail({
      where: { id: user.id },
      relations: ['apiKeys'],
    });
    expect(user.getApiKeys()).toHaveLength(3);
    expect(user.getApiKeys()).toMatchObject(expected);

    user.removeApiKey(expected[1]);
    await userRepository.save(user);
    user = await userRepository.findOneOrFail({
      where: { id: user.id },
      relations: ['apiKeys'],
    });
    expect(user.getApiKeys()).toHaveLength(2);
    expect(user.getApiKeys()).toMatchObject([expected[0], expected[2]]);

    await userRepository.remove(user);
  });
});
