import { Request } from 'express';
import { BalanceSheet } from '../entities/balanceSheet';
import { EntityManager } from 'typeorm';
import { User } from '../entities/user';
import { NoAccessError } from '../exceptions/no.access.error';

export class AccessCheckerService {
  public static async check(
    request: Request,
    balanceSheet: BalanceSheet,
    entityManager: EntityManager
  ): Promise<void> {
    if (request.userInfo) {
      const foundUser = await entityManager
        .getRepository(User)
        .findOne({ where: { email: request.userInfo.email } });
      if (foundUser) {
        const userWithAccess = balanceSheet.users.find(
          (u) => u.id === foundUser.id
        );
        if (userWithAccess) {
          return;
        }
      }
    }
    throw new NoAccessError();
  }
}
