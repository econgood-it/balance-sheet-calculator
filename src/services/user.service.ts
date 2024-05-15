import { DataSource } from 'typeorm';
import { NextFunction, Request, Response } from 'express';
import { handle } from '../exceptions/error.handler';
import { NoAccessError } from '../exceptions/no.access.error';
import deepFreeze from 'deep-freeze';
import { IRepoProvider } from '../repositories/repo.provider';
import { OrganizationResponseSchema } from '@ecogood/e-calculator-schemas/dist/organization.dto';

export interface IUserService {
  getInvitations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  joinOrganization(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}

export function makeUserService(
  dataSource: DataSource,
  repoProvider: IRepoProvider
): IUserService {
  async function getInvitations(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    dataSource.manager
      .transaction(async (entityManager) => {
        if (!req.authenticatedUser) {
          throw new NoAccessError();
        }
        const orgaRepo = repoProvider.getOrganizationRepo(entityManager);
        const organizationEntities =
          await orgaRepo.findOrganizationsWithInvitation(
            req.authenticatedUser.email
          );
        res.json(
          organizationEntities.map((o) => ({
            id: o.id,
            name: o.name,
          }))
        );
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  async function joinOrganization(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    dataSource.manager
      .transaction(async (entityManager) => {
        if (!req.authenticatedUser) {
          throw new NoAccessError();
        }
        const orgaRepo = repoProvider.getOrganizationRepo(entityManager);
        const organization = await orgaRepo.findByIdOrFail(
          Number(req.params.id)
        );
        const orgaWithNewMember = await orgaRepo.save(
          organization.join(req.authenticatedUser)
        );
        res.json(OrganizationResponseSchema.parse(orgaWithNewMember));
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  return deepFreeze({ getInvitations, joinOrganization });
}
