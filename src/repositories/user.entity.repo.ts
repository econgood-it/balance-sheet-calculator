import { User } from '../entities/user';
import { EntityManager, Repository } from 'typeorm';
import { Request } from 'express';
import UnauthorizedException from '../exceptions/unauthorized.exception';

export interface IUserEntityRepo {
  findByIdOrFail(id: number): Promise<User>;
  findOneByEmail(email: string): Promise<User | null>;
  findByEmailOrFail(email: string): Promise<User>;
  save(organizationEntity: User): Promise<User>;
  findCurrentUserOrFail(req: Request): Promise<User>;
  removeByEmail(email: string): Promise<User>;
}

export class UserEntityRepository implements IUserEntityRepo {
  private repo: Repository<User>;
  constructor(manager: EntityManager) {
    this.repo = manager.getRepository(User);
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.repo.findOneBy({ email: email });
  }

  findByEmailOrFail(email: string): Promise<User> {
    return this.repo.findOneByOrFail({ email: email });
  }

  findByIdOrFail(id: number): Promise<User> {
    return this.repo.findOneByOrFail({ id: id });
  }

  save(organizationEntity: User): Promise<User> {
    return this.repo.save(organizationEntity);
  }

  findCurrentUserOrFail(req: Request): Promise<User> {
    if (req.userInfo === undefined) {
      throw new UnauthorizedException('No user provided');
    }
    const userId = req.userInfo.id;
    return this.findByIdOrFail(userId);
  }

  async removeByEmail(email: string): Promise<User> {
    const user = await this.findByEmailOrFail(email);
    return this.repo.remove(user);
  }
}
