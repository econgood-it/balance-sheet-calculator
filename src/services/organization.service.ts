import { NextFunction, Request, Response } from 'express';

import { BalanceSheetItemsResponseSchema } from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import {
  OrganizationItemsResponseSchema,
  OrganizationRequestSchema,
} from '@ecogood/e-calculator-schemas/dist/organization.dto';
import { Workbook } from 'exceljs';
import { DataSource } from 'typeorm';
import { BalanceSheetCreateRequest } from '../dto/balance.sheet.dto';
import { BalanceSheetEntity } from '../entities/balance.sheet.entity';
import { OrganizationEntity } from '../entities/organization.entity';
import { handle } from '../exceptions/error.handler';
import { NoAccessError } from '../exceptions/no.access.error';
import NotFoundException from '../exceptions/not.found.exception';
import { parseLanguageParameter } from '../language/translations';
import { BalanceSheetReader } from '../reader/balanceSheetReader/balance.sheet.reader';
import { IOldRepoProvider } from '../repositories/oldRepoProvider';
import { Authorization } from '../security/authorization';
import { parseSaveFlag } from './utils';
import { z } from 'zod';

export class OrganizationService {
  constructor(
    private dataSource: DataSource,
    private repoProvider: IOldRepoProvider
  ) {}

  public async createOrganization(
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
        const organization = OrganizationRequestSchema.parse(req.body);
        const organizationEntity = await orgaRepo.save(
          new OrganizationEntity(
            undefined,
            { ...organization, invitations: [] },
            [{ id: req.authenticatedUser.id }]
          )
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
        Authorization.checkIfCurrentUserIsMember(req, organizationEntity);
        organizationEntity.mergeWithRequest(organization);
        const updatedOrganizationEntity =
          await organizationEntityRepository.save(organizationEntity);

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
        if (!req.authenticatedUser) {
          throw new NoAccessError();
        }
        const orgaRepo =
          this.repoProvider.getOrganizationEntityRepo(entityManager);
        const organizationEntities = await orgaRepo.findOrganizationsOfUser(
          req.authenticatedUser.id
        );
        res.json(
          OrganizationItemsResponseSchema.parse(
            organizationEntities.map((o) => ({
              id: o.id,
              name: o.organization.name,
            }))
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
        Authorization.checkIfCurrentUserIsMember(req, foundOrganizationEntity);
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
    try {
      const balanceSheetEntity = new BalanceSheetCreateRequest(
        req.body
      ).toBalanceEntity();
      this.createBalanceSheetEntityForOrganization(
        req,
        res,
        next,
        balanceSheetEntity
      );
    } catch (error: any) {
      handle(error, next);
    }
  }

  public async uploadBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (req.file) {
        const wb = await new Workbook().xlsx.load(req.file.buffer);
        const balanceSheetReader = new BalanceSheetReader();
        const balanceSheetEntity = balanceSheetReader.readFromWorkbook(wb);
        this.createBalanceSheetEntityForOrganization(
          req,
          res,
          next,
          balanceSheetEntity
        );
      } else {
        res.json({ message: 'File empty' });
      }
    } catch (error: any) {
      handle(error, next);
    }
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
        Authorization.checkIfCurrentUserIsMember(req, organizationEntity);
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

  public inviteUser(req: Request, res: Response, next: NextFunction) {
    this.dataSource.manager
      .transaction(async (entityManager) => {
        const orgaRepo =
          this.repoProvider.getOrganizationEntityRepo(entityManager);
        const organizationEntity = await orgaRepo.findByIdOrFail(
          Number(req.params.id),
          false
        );
        Authorization.checkIfCurrentUserIsMember(req, organizationEntity);
        const email = z.string().email().parse(req.params.email);
        organizationEntity.invite(email);
        await orgaRepo.save(organizationEntity);
        res.status(201);
        res.send();
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  private createBalanceSheetEntityForOrganization(
    req: Request,
    res: Response,
    next: NextFunction,
    balanceSheetEntity: BalanceSheetEntity
  ) {
    const language = parseLanguageParameter(req.query.lng);
    const saveFlag = parseSaveFlag(req.query.save);
    this.dataSource.manager
      .transaction(async (entityManager) => {
        const balanceSheetRepo =
          this.repoProvider.getBalanceSheetEntityRepo(entityManager);
        const orgaRepo =
          this.repoProvider.getOrganizationEntityRepo(entityManager);

        const organizationEntity = await orgaRepo.findByIdOrFail(
          Number(req.params.id),
          true
        );
        if (!organizationEntity) {
          throw new NotFoundException('Organization not found');
        }
        Authorization.checkIfCurrentUserIsMember(req, organizationEntity);

        await balanceSheetEntity.reCalculate();
        if (saveFlag) {
          await balanceSheetRepo.save(balanceSheetEntity);
          organizationEntity.addBalanceSheetEntity(balanceSheetEntity);
          await orgaRepo.save(organizationEntity);
        }

        res.json(balanceSheetEntity.toJson(language));
      })
      .catch((error) => {
        handle(error, next);
      });
  }
}
