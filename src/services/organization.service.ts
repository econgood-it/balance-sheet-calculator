import { NextFunction, Request, Response } from 'express';

import { handle } from '../exceptions/error.handler';
import { DataSource } from 'typeorm';
import {
  ORGANIZATION_RELATIONS,
  OrganizationEntity,
} from '../entities/organization.entity';
import { Authorization } from '../security/authorization';
import { OrganizationParser } from '../models/organization';
import { OrganizationEntityRepository } from '../repositories/organization.entity.repo';
import { IRepoProvider } from '../repositories/repo.provider';

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
        const organization = OrganizationParser.fromJson(req.body);
        const currentUser = await Authorization.findCurrentUserOrFail(
          req,
          entityManager
        );
        const organizationEntity = await orgaRepo.save(
          new OrganizationEntity(undefined, organization, [currentUser])
        );
        res.json(OrganizationParser.toJson(organizationEntity));
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
          entityManager.getRepository(OrganizationEntity);
        const organizationIdParam: number = Number(req.params.id);
        const organization = OrganizationParser.fromJson(req.body);
        const organizationEntity =
          await organizationEntityRepository.findOneOrFail({
            where: { id: organizationIdParam },
            relations: ORGANIZATION_RELATIONS,
          });
        const updatedOrganizationEntity =
          await organizationEntityRepository.save(
            new OrganizationEntity(
              organizationEntity.id,
              organization,
              organizationEntity.members
            )
          );

        res.json(OrganizationParser.toJson(updatedOrganizationEntity));
      })
      .catch((error) => {
        handle(error, next);
      });
  }
}
