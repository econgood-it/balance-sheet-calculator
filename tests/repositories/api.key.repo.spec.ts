import { User } from '../../src/entities/user';
import { Role } from '../../src/entities/enums';
import { DataSource } from 'typeorm';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import { ConfigurationReader } from '../../src/reader/configuration.reader';
import { ApiKey } from '../../src/entities/api.key';
import { v4 as uuid4 } from 'uuid';
import {
  ApiKeyRepository,
  IApiKeyRepo,
} from '../../src/repositories/api.key.entity.repo';
import {
  IUserEntityRepo,
  UserEntityRepository,
} from '../../src/repositories/user.entity.repo';

describe('ApiKeyRepo', () => {
  let apiKeyRepository: IApiKeyRepo;
  let userRepository: IUserEntityRepo;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      ConfigurationReader.read()
    );
    apiKeyRepository = new ApiKeyRepository(dataSource.manager);
    userRepository = new UserEntityRepository(dataSource.manager);
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
    apiKey = await apiKeyRepository.findByIdOrFail(savedApiKey.id!);
    expect(apiKey.user.id).toBe(user.id);
    expect(apiKey.compareValue(valueBeforeHashing)).toBeTruthy();
    expect(apiKey.compareValue('wrongAPIKey')).toBeFalsy();

    await userRepository.remove(user);
  });
});
