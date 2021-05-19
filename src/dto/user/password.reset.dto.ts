import { IsString } from 'class-validator';
import { expectString, strictObjectMapper } from '@daniel-faber/json-ts';

export class PasswordResetDto {
  @IsString()
  public readonly password: string;

  constructor(password: string) {
    this.password = password;
  }

  public static readonly fromJSON = strictObjectMapper(
    (accessor) =>
      new PasswordResetDto(accessor.get('newPassword', expectString))
  );
}
