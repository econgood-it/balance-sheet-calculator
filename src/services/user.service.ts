import { DataSource } from 'typeorm';
import { IOldRepoProvider } from '../repositories/oldRepoProvider';
import { NextFunction, Request, Response } from 'express';
import { handle } from '../exceptions/error.handler';
import { NoAccessError } from '../exceptions/no.access.error';

export class UserService {
  constructor(
    private dataSource: DataSource,
    private repoProvider: IOldRepoProvider
  ) {}

  public async getInvitations(req: Request, res: Response, next: NextFunction) {
    this.dataSource.manager
      .transaction(async (entityManager) => {
        if (!req.authenticatedUser) {
          throw new NoAccessError();
        }
        const orgaRepo =
          this.repoProvider.getOrganizationEntityRepo(entityManager);
        const organizationEntities =
          await orgaRepo.findOrganizationsWithInvitation(
            req.authenticatedUser.email
          );
        res.json(
          organizationEntities.map((o) => ({
            id: o.id,
            name: o.organization.name,
          }))
        );
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  public async joinOrganization(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    this.dataSource.manager
      .transaction(async (entityManager) => {
        if (!req.authenticatedUser) {
          throw new NoAccessError();
        }
        const orgaRepo =
          this.repoProvider.getOrganizationEntityRepo(entityManager);
        const organizationEntity = await orgaRepo.findByIdOrFail(
          Number(req.params.id)
        );
        organizationEntity.join(req.authenticatedUser);
        await orgaRepo.save(organizationEntity);
        res.json(organizationEntity.toJson());
      })
      .catch((error) => {
        handle(error, next);
      });
  }
}
