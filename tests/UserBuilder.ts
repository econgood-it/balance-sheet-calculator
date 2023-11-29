import { v4 as uuid4 } from 'uuid';
import { Role, User } from '../src/models/user';

export class UserBuilder {
  private user = {
    id: uuid4(),
    email: `${uuid4()}@example.com`,
    role: Role.User,
  };

  public build(): User {
    return this.user;
  }
}
