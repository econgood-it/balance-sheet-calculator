import { Request, Response, NextFunction } from "express";
import {Connection} from "typeorm";
import * as jwt from "jwt-simple";
import * as moment from "moment";


export interface IUser  {
  id: number,
  username: string,
  password: string,
}

export class UserService {
  constructor(private connection: Connection, public jwtSecret: string) {
  }

  private genToken = (user: IUser): Object => {
    let expires = moment.utc().add({days: 7}).unix();
    let token = jwt.encode({
      exp: expires,
      username: user.username
    }, this.jwtSecret);

    return {
      token: "JWT " + token,
      expires: moment.unix(expires).format(),
      user: user.id
    };
  }

  public async login(req: Request, res: Response) {
    res.json(this.genToken({username: 'mrudolph', id: 1, password: 'p'}));
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
}

