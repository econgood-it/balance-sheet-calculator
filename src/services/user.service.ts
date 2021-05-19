import { NextFunction, Request, Response } from 'express';
import { Connection } from 'typeorm';
import * as jwt from 'jwt-simple';
import * as moment from 'moment';
import { UserDTO } from '../dto/user/userDTO';
import { validateOrReject } from 'class-validator';
import { User } from '../entities/user';
import BadRequestException from '../exceptions/bad.request.exception';
import { handle } from '../exceptions/ErrorHandler';

export interface IUser {
  id: number;
  username: string;
  password: string;
}

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
        const userDTO: UserDTO = UserDTO.fromJSON(req.body);
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

    // try {
    //   req.checkBody("username", "Invalid username").notEmpty();
    //   req.checkBody("password", "Invalid password").notEmpty();
    //
    //   let errors = req.validationErrors();
    //   if (errors) throw errors;
    //
    //   let user = await User.findOne({ "username": req.body.username }).exec();
    //
    //   if (user === null) throw "User not found";
    //
    //   let success = await user.comparePassword(req.body.password);
    //   if (success === false) throw "";
    //
    //   res.status(200).json(this.genToken(user));
    // } catch (err) {
    //   res.status(401).json({ "message": "Invalid credentials", "errors": err });
    // }
  }

  public async createUser(req: Request, res: Response, next: NextFunction) {
    this.connection.manager
      .transaction(async (entityManager) => {
        const userDTO: UserDTO = UserDTO.fromJSON(req.body);
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

  private async validateOrFail(userDTO: UserDTO) {
    await validateOrReject(userDTO, {
      validationError: { target: false },
    });
  }
}
