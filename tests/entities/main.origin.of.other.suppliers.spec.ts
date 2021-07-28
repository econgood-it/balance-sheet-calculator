import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { Connection, Repository } from 'typeorm';
import { ConfigurationReader } from '../../src/configuration.reader';
import { MainOriginOfOtherSuppliers } from '../../src/entities/main.origin.of.other.suppliers';

describe('MainOriginOfOtherSuppliers ', () => {
  let mainOriginOfOtherSuppliersRepository: Repository<MainOriginOfOtherSuppliers>;
  let connection: Connection;

  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        ConfigurationReader.read()
      );
    mainOriginOfOtherSuppliersRepository = connection.getRepository(
      MainOriginOfOtherSuppliers
    );
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should be saved and deleted', async () => {
    const mainOriginOfOtherSuppliers: MainOriginOfOtherSuppliers =
      new MainOriginOfOtherSuppliers(undefined, 'DEU', 200);
    const result = await mainOriginOfOtherSuppliersRepository.save(
      mainOriginOfOtherSuppliers
    );
    expect(result.countryCode).toBe('DEU');
    expect(result.costs).toBe(200);
    await mainOriginOfOtherSuppliersRepository.remove(result);
  });
});
