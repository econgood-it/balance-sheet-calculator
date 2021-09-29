import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { Connection, Repository } from 'typeorm';
import { ConfigurationReader } from '../../src/configuration.reader';
import { Region } from '../../src/entities/region';
import { BalanceSheetVersion } from '../../src/entities/enums';

describe('Region', () => {
  let regionRepository: Repository<Region>;
  let connection: Connection;

  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        ConfigurationReader.read()
      );
    regionRepository = connection.getRepository(Region);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should save and delete region', async () => {
    const region: Region = new Region(
      undefined,
      1.2,
      'DEU',
      'Germany',
      3.4,
      BalanceSheetVersion.v5_0_4
    );
    const result = await regionRepository.save(region);
    expect(result).toMatchObject({
      pppIndex: 1.2,
      countryCode: 'DEU',
      countryName: 'Germany',
      ituc: 3.4,
      validUntilVersion: BalanceSheetVersion.v5_0_4,
    });
    await regionRepository.remove(result);
  });
});
