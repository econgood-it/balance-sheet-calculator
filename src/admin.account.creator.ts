import { Connection } from 'typeorm';
import { Configuration } from './configuration.reader';
import { User } from './entities/user';
import { Role } from './entities/enums';

export class AdminAccountCreator {
  public static async saveAdmin(
    connection: Connection,
    configuration: Configuration
  ) {
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
  }
}
