import { NextFunction, Request, Response } from 'express';
import { Connection } from 'typeorm';
import * as jwt from 'jwt-simple';
import * as moment from 'moment';
import { UserDto } from '../dto/user/user.dto';
import { validateOrReject } from 'class-validator';
import { User } from '../entities/user';
import BadRequestException from '../exceptions/bad.request.exception';
import { handle } from '../exceptions/ErrorHandler';
import { PasswordResetDto } from '../dto/user/password.reset.dto';

export class UserService {
  constructor(private connection: Connection, public jwtSecret: string) {}

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
      token: token,
      expires: moment.unix(expires).format(),
      user: user.id,
    };
  };

  public async getToken(req: Request, res: Response, next: NextFunction) {
    this.connection.manager
      .transaction(async (entityManager) => {
        const userDTO: UserDto = UserDto.fromJSON(req.body);
        await this.validateOrFail(userDTO);
        const user: User = userDTO.toUser();
        const userRepository = entityManager.getRepository(User);
        const foundUser: User = await userRepository.findOneOrFail({
          email: user.email,
        });
        const success = foundUser.comparePassword(user.password);
        if (success === false) {
          throw new BadRequestException('Invalid credentials');
        }
        res.json(this.genToken(foundUser));
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  public async createUser(req: Request, res: Response, next: NextFunction) {
    this.connection.manager
      .transaction(async (entityManager) => {
        const userDTO: UserDto = UserDto.fromJSON(req.body);
        await this.validateOrFail(userDTO);
        const user: User = userDTO.toUser();
        const userRepository = entityManager.getRepository(User);
        const foundUser = await userRepository.findOne({
          email: user.email,
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
    this.connection.manager
      .transaction(async (entityManager) => {
        const email: string = req.body.email;
        const userRepository = entityManager.getRepository(User);
        const foundUser = await userRepository.findOne({
          email: email,
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

  public async resetPassword(req: any, res: Response, next: NextFunction) {
    this.connection.manager
      .transaction(async (entityManager) => {
        if (req.user === undefined || req.user.id === undefined) {
          throw new Error('User undefined');
        }
        const userId = req.user.id;
        const passwordResetDto = PasswordResetDto.fromJSON(req.body);
        await this.validateOrFail(passwordResetDto);
        const userRepository = entityManager.getRepository(User);
        const foundUser = await userRepository.findOneOrFail(userId);
        foundUser.password = passwordResetDto.password;
        await userRepository.save(foundUser);
        res.json({ message: 'Password has been reset to new one' });
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  private async validateOrFail(userDTO: UserDto | PasswordResetDto) {
    await validateOrReject(userDTO, {
      validationError: { target: false },
    });
  }
}
