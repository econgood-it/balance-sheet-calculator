import { Request } from 'express';
import { BalanceSheetEntity } from '../entities/balance.sheet.entity';
import { EntityManager } from 'typeorm';
import { User } from '../entities/user';
import { NoAccessError } from '../exceptions/no.access.error';
import UnauthorizedException from '../exceptions/unauthorized.exception';

export namespace Authorization {
  export async function isGrantedForCurrentUserOrFail(
    request: Request,
    balanceSheet: BalanceSheetEntity,
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
  export async function findCurrentUserOrFail(
    req: Request,
    entityManager: EntityManager
  ) {
    if (req.userInfo === undefined) {
      throw new UnauthorizedException('No user provided');
    }
    const userId = req.userInfo.id;
    const userRepository = entityManager.getRepository(User);
    return await userRepository.findOneOrFail({ where: { id: userId } });
  }
}
