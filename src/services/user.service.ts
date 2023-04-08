import { NextFunction, Request, Response } from 'express';
import { DataSource } from 'typeorm';
import * as jwt from 'jwt-simple';
import * as moment from 'moment';
import { parseAsUser, User } from '../entities/user';
import BadRequestException from '../exceptions/bad.request.exception';
import { handle } from '../exceptions/error.handler';
import { PasswordResetRequestBodySchema } from '@ecogood/e-calculator-schemas/dist/user.schema';

export class UserService {
  constructor(private dataSource: DataSource, public jwtSecret: string) {}

  private genToken = (user: User): Object => {
    const expires = moment.utc().add({ days: 7 }).unix();
    const token = jwt.encode(
      {
        exp: expires,
        email: user.email,
      },
      this.jwtSecret
    );

    return {
      token,
      expires: moment.unix(expires).format(),
      user: user.id,
    };
  };

  public async getToken(req: Request, res: Response, next: NextFunction) {
    this.dataSource.manager
      .transaction(async (entityManager) => {
        const user: User = parseAsUser(req.body);
        const userRepository = entityManager.getRepository(User);
        const foundUser: User = await userRepository.findOneOrFail({
          where: {
            email: user.email,
          },
        });
        const success = foundUser.comparePassword(user.password);
        if (!success) {
          throw new BadRequestException('Invalid credentials');
        }
        res.json(this.genToken(foundUser));
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  public async createUser(req: Request, res: Response, next: NextFunction) {
    this.dataSource.manager
      .transaction(async (entityManager) => {
        const user: User = parseAsUser(req.body);
        const userRepository = entityManager.getRepository(User);
        const foundUser = await userRepository.findOne({
          where: {
            email: user.email,
          },
        });
        if (foundUser) {
          throw new Error('User already exists');
        }
        await userRepository.save(user);
        res.status(201).json({ message: 'User created' });
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  public async deleteUser(req: Request, res: Response, next: NextFunction) {
    this.dataSource.manager
      .transaction(async (entityManager) => {
        const email: string = req.body.email;
        const userRepository = entityManager.getRepository(User);
        const foundUser = await userRepository.findOne({
          where: {
            email,
          },
        });
        if (foundUser) {
          await userRepository.remove(foundUser);
        }
        res.status(200).json({ message: `Deleted user with email ${email}` });
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  public async resetPassword(req: Request, res: Response, next: NextFunction) {
    this.dataSource.manager
      .transaction(async (entityManager) => {
        if (req.userInfo === undefined || req.userInfo.id === undefined) {
          throw new Error('User undefined');
        }
        const userId = req.userInfo.id;
        const passwordResetRequestBody = PasswordResetRequestBodySchema.parse(
          req.body
        );
        const userRepository = entityManager.getRepository(User);
        const foundUser = await userRepository.findOneOrFail({
          where: { id: userId },
        });
        foundUser.password = passwordResetRequestBody.newPassword;
        await userRepository.save(foundUser);
        res.json({ message: 'Password has been reset to new one' });
      })
      .catch((error) => {
        handle(error, next);
      });
  }
}
