import { NextFunction, Request, Response } from 'express';

import { handle } from '../exceptions/error.handler';
import { OrganizationRequestSchema } from '@ecogood/e-calculator-schemas/dist/organization.dto';
import { Connection } from 'typeorm';
import { OrganizationEntity } from '../entities/organization.entity';
import { organizationEntityToResponse } from '../models/organization';

export class OrganizationService {
  constructor(private connection: Connection) {}
  public async createOrganization(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    this.connection.manager
      .transaction(async (entityManager) => {
        const organizationEntityRepository =
          entityManager.getRepository(OrganizationEntity);

        const organization = OrganizationRequestSchema.parse(req.body);
        const organizationEntity = await organizationEntityRepository.save(
          new OrganizationEntity(undefined, organization)
        );
        res.json(organizationEntityToResponse(organizationEntity));
      })
      .catch((error) => {
        handle(error, next);
      });
  }
}
