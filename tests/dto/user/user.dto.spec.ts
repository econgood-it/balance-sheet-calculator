import { UserDto } from '../../../src/dto/user/user.dto';
import { Role } from '../../../src/entities/enums';

describe('UserDTO', () => {
  it('should create DTO and return user entity', () => {
    const json = {
      email: 'email@example.com',
      password: 'amazingsecret',
    };
    const userDTO: UserDto = UserDto.fromJSON(json);
    const result = userDTO.toUser();
    expect(result).toMatchObject({ ...json, role: Role.User });
  });
});
