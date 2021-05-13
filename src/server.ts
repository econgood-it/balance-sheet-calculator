import 'reflect-metadata';
import { DatabaseConnectionCreator } from './database.connection.creator';
import { Connection } from 'typeorm';
import App from './app';
import { LoggingService } from './logging';
import { Configuration, ConfigurationReader } from './configuration.reader';
import { User } from './entities/user';
import { Role } from './entities/enums';

const configuration = ConfigurationReader.read();

const saveAdmin = async (
  connection: Connection,
  configuration: Configuration
) => {
  await connection.manager.transaction(async (entityManager) => {
    const userRepository = entityManager.getRepository(User);
    const foundUser = await userRepository.findOne({
      email: configuration.adminEmail,
    });

    await userRepository.save(
      new User(
        foundUser ? foundUser.id : undefined,
        configuration.adminEmail,
        configuration.adminPassword,
        Role.Admin
      )
    );
  });
};

DatabaseConnectionCreator.createConnectionAndRunMigrations(configuration)
  .then(async (connection: Connection) => {
    await saveAdmin(connection, configuration);
    const app = new App(connection, configuration);
    app.start();
  })
  .catch((error) => LoggingService.error(error.message, error));
