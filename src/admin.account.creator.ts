import { DataSource } from 'typeorm';
import { Configuration } from './reader/configuration.reader';
import { User } from './entities/user';
import { Role } from './entities/enums';

export class AdminAccountCreator {
  public static async saveAdmin(
    dataSource: DataSource,
    configuration: Configuration
  ) {
    await dataSource.manager.transaction(async (entityManager) => {
      const userRepository = entityManager.getRepository(User);
      const foundUser = await userRepository.findOneBy({
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
  }
}
