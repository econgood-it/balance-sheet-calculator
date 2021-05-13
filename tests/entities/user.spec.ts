import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { Connection, Repository } from 'typeorm';
import { ConfigurationReader } from '../../src/configuration.reader';
import { User } from '../../src/entities/user';
import { Role } from '../../src/entities/enums';

describe('User', () => {
  let userRepository: Repository<User>;
  let connection: Connection;

  beforeAll(async (done) => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        ConfigurationReader.read()
      );
    userRepository = connection.getRepository(User);
    done();
  });

  afterAll(async (done) => {
    await connection.close();
    done();
  });

  it('should be saved and deleted', async (done) => {
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
    done();
  });
});
