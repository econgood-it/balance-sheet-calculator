import { v4 as uuid4 } from 'uuid';
import { Role, User } from '../src/models/user';

export class Auth {
  public readonly token: string;
  public readonly user: User;
  constructor(role: Role, id?: string) {
    this.token = uuid4();
    this.user = {
      id: id ?? uuid4(),
      email: `${uuid4()}@example.com`,
      role,
    };
  }

  public toHeaderPair() {
    return { key: 'Authorization', value: `Bearer ${this.token}` };
  }
}

export class AuthBuilder {
  private tokenToUserMap: Map<string, User> = new Map<string, User>();
  public addAuditor(): Auth {
    const auth = new Auth(Role.Auditor);
    this.tokenToUserMap.set(auth.token, auth.user);
    return auth;
  }

  public addUser(): Auth {
    const auth = new Auth(Role.User);
    this.tokenToUserMap.set(auth.token, auth.user);
    return auth;
  }

  public getTokenMap() {
    return this.tokenToUserMap;
  }
}
