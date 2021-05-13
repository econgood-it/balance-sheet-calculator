import { UserDTO } from '../../../src/dto/user/userDTO';
import { Role } from '../../../src/entities/enums';

describe('UserDTO', () => {
  it('should create DTO and return user entity', () => {
    const json = {
      email: 'email@example.com',
      password: 'amazingsecret',
    };
    const userDTO: UserDTO = UserDTO.fromJSON(json);
    const result = userDTO.toUser();
    expect(result).toMatchObject({ ...json, role: Role.User });
  });
});
