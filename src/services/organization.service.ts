import { NextFunction, Request, Response } from 'express';

import { handle } from '../exceptions/error.handler';
import { DataSource } from 'typeorm';
import { OrganizationEntity } from '../entities/organization.entity';
import { Authorization } from '../security/authorization';
import { IRepoProvider } from '../repositories/repo.provider';
import {
  OrganizationItemsResponseSchema,
  OrganizationRequestSchema,
} from '@ecogood/e-calculator-schemas/dist/organization.dto';
import { NoAccessError } from '../exceptions/no.access.error';

export class OrganizationService {
  constructor(
    private dataSource: DataSource,
    private repoProvider: IRepoProvider
  ) {}

  public async createOrganization(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    this.dataSource.manager
      .transaction(async (entityManager) => {
        const orgaRepo =
          this.repoProvider.getOrganizationEntityRepo(entityManager);
        const userRepo = this.repoProvider.getUserEntityRepo(entityManager);
        const organization = OrganizationRequestSchema.parse(req.body);
        const currentUser = await userRepo.findCurrentUserOrFail(req);
        const organizationEntity = await orgaRepo.save(
          new OrganizationEntity(undefined, organization, [currentUser])
        );
        res.json(organizationEntity.toJson());
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  public async updateOrganization(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    this.dataSource.manager
      .transaction(async (entityManager) => {
        const organizationEntityRepository =
          this.repoProvider.getOrganizationEntityRepo(entityManager);
        const organizationIdParam: number = Number(req.params.id);
        const organization = OrganizationRequestSchema.parse(req.body);
        const organizationEntity =
          await organizationEntityRepository.findByIdOrFail(
            organizationIdParam
          );
        await Authorization.checkIfCurrentUserIsMember(req, organizationEntity);
        const updatedOrganizationEntity =
          await organizationEntityRepository.save(
            new OrganizationEntity(
              organizationEntity.id,
              organization,
              organizationEntity.members
            )
          );

        res.json(updatedOrganizationEntity.toJson());
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  public async getOrganizationsOfCurrentUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    this.dataSource.manager
      .transaction(async (entityManager) => {
        if (!req.userInfo) {
          throw new NoAccessError();
        }
        const orgaRepo =
          this.repoProvider.getOrganizationEntityRepo(entityManager);
        const organizationEntities = await orgaRepo.findOrganizationsOfUser(
          req.userInfo?.id
        );
        res.json(
          OrganizationItemsResponseSchema.parse(
            organizationEntities.map((o) => ({ id: o.id }))
          )
        );
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  public async getOrganization(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    this.dataSource.manager
      .transaction(async (entityManager) => {
        const orgaRepo =
          this.repoProvider.getOrganizationEntityRepo(entityManager);
        const foundOrganizationEntity = await orgaRepo.findByIdOrFail(
          Number(req.params.id)
        );
        await Authorization.checkIfCurrentUserIsMember(
          req,
          foundOrganizationEntity
        );
        res.json(foundOrganizationEntity.toJson());
      })
      .catch((error) => {
        handle(error, next);
      });
  }
}
