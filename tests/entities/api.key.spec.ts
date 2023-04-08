import { User } from '../../src/entities/user';
import { Role } from '../../src/entities/enums';
import { DataSource, Repository } from 'typeorm';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import { ConfigurationReader } from '../../src/configuration.reader';
import { API_KEY_RELATIONS, ApiKey } from '../../src/entities/api.key';
import { v4 as uuid4 } from 'uuid';

describe('ApiKey', () => {
  let apiKeyRepository: Repository<ApiKey>;
  let userRepository: Repository<User>;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      ConfigurationReader.read()
    );
    apiKeyRepository = dataSource.getRepository(ApiKey);
    userRepository = dataSource.getRepository(User);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });
  it('should be saved', async () => {
    const user: User = await userRepository.save(
      new User(undefined, `${uuid4()}@ecogood.org`, 'takecare', Role.User)
    );

    let apiKey = new ApiKey(undefined, undefined, user);
    const valueBeforeHashing = apiKey.value;
    const savedApiKey = await apiKeyRepository.save(apiKey);
    apiKey = await apiKeyRepository.findOneOrFail({
      where: { id: savedApiKey.id },
      relations: API_KEY_RELATIONS,
    });
    expect(apiKey.user.id).toBe(user.id);
    expect(apiKey.compareValue(valueBeforeHashing)).toBeTruthy();
    expect(apiKey.compareValue('wrongAPIKey')).toBeFalsy();

    await userRepository.remove(user);
  });
});
