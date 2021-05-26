import { expectString, strictObjectMapper } from '@daniel-faber/json-ts';
import { MinLength } from 'class-validator';

export class PasswordResetDto {
  @MinLength(20)
  public readonly password: string;

  constructor(password: string) {
    this.password = password;
  }

  public static readonly fromJSON = strictObjectMapper(
    (accessor) =>
      new PasswordResetDto(accessor.get('newPassword', expectString))
  );
}
