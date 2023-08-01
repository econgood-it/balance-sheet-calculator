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
import { BalanceSheetCreateRequest } from '../dto/balance.sheet.dto';
import { parseLanguageParameter } from '../language/translations';
import NotFoundException from '../exceptions/not.found.exception';
import ForbiddenException from '../exceptions/forbidden.exception';
import { BalanceSheetItemsResponseSchema } from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';

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

  public async createBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const language = parseLanguageParameter(req.query.lng);

    this.dataSource.manager
      .transaction(async (entityManager) => {
        const balanceSheetRepo =
          this.repoProvider.getBalanceSheetEntityRepo(entityManager);
        const orgaRepo =
          this.repoProvider.getOrganizationEntityRepo(entityManager);
        const balanceSheetEntity = new BalanceSheetCreateRequest(
          req.body
        ).toBalanceEntity([]);
        const organizationEntity = await orgaRepo.findByIdOrFail(
          Number(req.params.id),
          true
        );
        if (!req.userInfo) {
          throw new NoAccessError();
        }
        if (!organizationEntity) {
          throw new NotFoundException('Organization not found');
        }
        await Authorization.checkIfCurrentUserIsMember(req, organizationEntity);

        await balanceSheetEntity.reCalculate();

        const savedBalanceSheetEntity = await balanceSheetRepo.save(
          balanceSheetEntity
        );
        organizationEntity.addBalanceSheetEntity(savedBalanceSheetEntity);
        await orgaRepo.save(organizationEntity);

        res.json(savedBalanceSheetEntity.toJson(language));
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  public async getBalanceSheets(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    this.dataSource.manager
      .transaction(async (entityManager) => {
        const organizationEntityRepo =
          this.repoProvider.getOrganizationEntityRepo(entityManager);
        const organizationEntity = await organizationEntityRepo.findByIdOrFail(
          Number(req.params.id),
          true
        );
        await Authorization.checkIfCurrentUserIsMember(req, organizationEntity);
        res.json(
          BalanceSheetItemsResponseSchema.parse(
            organizationEntity.balanceSheetEntities
              ? organizationEntity.balanceSheetEntities.map((b) => ({
                  id: b.id,
                }))
              : []
          )
        );
      })
      .catch((error) => {
        handle(error, next);
      });
  }
}
