import { IsEmail, MinLength } from 'class-validator';
import { expectString, strictObjectMapper } from '@daniel-faber/json-ts';
import { User } from '../../entities/user';
import { Role } from '../../entities/enums';

export class UserDto {
  @IsEmail()
  public readonly email: string;

  @MinLength(20)
  public readonly password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  public static readonly fromJSON = strictObjectMapper(
    (accessor) =>
      new UserDto(
        accessor.get('email', expectString),
        accessor.get('password', expectString)
      )
  );

  public toUser(): User {
    return new User(undefined, this.email, this.password, Role.User);
  }
}
