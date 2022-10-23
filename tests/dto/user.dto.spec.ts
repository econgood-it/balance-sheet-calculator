import { Role } from '../../src/entities/enums';
import { UserRequestBodySchema } from '../../src/dto/user.dto';

describe('UserDTO', () => {
  it('should create DTO and return user entity', () => {
    const json = {
      email: 'email@example.com',
      password: 'amazingsecreturieojqfiejqiofjeqiojfoiqwej',
    };
    const result = UserRequestBodySchema.parse(json);
    expect(result).toMatchObject({ ...json, role: Role.User });
  });
});
