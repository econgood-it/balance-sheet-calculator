import { NextFunction, Request, Response } from 'express';

import { handle } from '../exceptions/error.handler';
import { DataSource } from 'typeorm';
import { OrganizationEntity } from '../entities/organization.entity';
import { Authorization } from '../security/authorization';
import { OrganizationParser } from '../models/organization';

export class OrganizationService {
  constructor(private dataSource: DataSource) {}
  public async createOrganization(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    this.dataSource.manager
      .transaction(async (entityManager) => {
        const organizationEntityRepository =
          entityManager.getRepository(OrganizationEntity);

        const organization = OrganizationParser.fromJson(req.body);
        const currentUser = await Authorization.findCurrentUserOrFail(
          req,
          entityManager
        );
        const organizationEntity = await organizationEntityRepository.save(
          new OrganizationEntity(undefined, organization, [currentUser])
        );
        res.json(OrganizationParser.toJson(organizationEntity));
      })
      .catch((error) => {
        handle(error, next);
      });
  }
}
