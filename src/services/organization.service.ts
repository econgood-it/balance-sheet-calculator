import { NextFunction, Request, Response } from 'express';

import { BalanceSheetItemsResponseSchema } from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import {
  OrganizationItemsResponseSchema,
  OrganizationRequestSchema,
  OrganizationResponseSchema,
} from '@ecogood/e-calculator-schemas/dist/organization.dto';
import { Workbook } from 'exceljs';
import { DataSource } from 'typeorm';
import { BalanceSheetCreateRequest } from '../dto/balance.sheet.dto';
import { BalanceSheetEntity } from '../entities/balance.sheet.entity';
import { handle } from '../exceptions/error.handler';
import { NoAccessError } from '../exceptions/no.access.error';
import NotFoundException from '../exceptions/not.found.exception';
import { parseLanguageParameter } from '../language/translations';
import { BalanceSheetReader } from '../reader/balanceSheetReader/balance.sheet.reader';
import { IOldRepoProvider } from '../repositories/oldRepoProvider';
import {
  Authorization,
  checkIfCurrentUserIsMember,
} from '../security/authorization';
import { parseSaveFlag } from './utils';
import { z } from 'zod';
import { IRepoProvider } from '../repositories/repo.provider';
import { makeOrganization } from '../models/organization';
import deepFreeze from 'deep-freeze';

export interface IOrganizationService {
  createOrganization(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  updateOrganization(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  getOrganization(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  inviteUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  getOrganizationsOfCurrentUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}

export function makeOrganizationService(
  dataSource: DataSource,
  repoProvider: IRepoProvider
): IOrganizationService {
  async function createOrganization(
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
        const organization = await orgaRepo.save(
          makeOrganization({
            ...OrganizationRequestSchema.parse(req.body),
            invitations: [],
            members: [{ id: req.authenticatedUser.id }],
          })
        );
        res.json(OrganizationResponseSchema.parse(organization));
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  async function getOrganization(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    dataSource.manager
      .transaction(async (entityManager) => {
        const orgaRepo = repoProvider.getOrganizationRepo(entityManager);
        const foundOrganization = await orgaRepo.findByIdOrFail(
          Number(req.params.id)
        );
        checkIfCurrentUserIsMember(req, foundOrganization);
        res.json(OrganizationResponseSchema.parse(foundOrganization));
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  async function inviteUser(req: Request, res: Response, next: NextFunction) {
    dataSource.manager
      .transaction(async (entityManager) => {
        const orgaRepo = repoProvider.getOrganizationRepo(entityManager);
        const organization = await orgaRepo.findByIdOrFail(
          Number(req.params.id)
        );
        checkIfCurrentUserIsMember(req, organization);
        const email = z.string().email().parse(req.params.email);
        await orgaRepo.save(organization.invite(email));
        res.status(201);
        res.send();
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  async function getOrganizationsOfCurrentUser(
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
        const organizationEntities = await orgaRepo.findOrganizationsOfUser(
          req.authenticatedUser.id
        );
        res.json(
          OrganizationItemsResponseSchema.parse(
            organizationEntities.map((o) => ({
              id: o.id,
              name: o.name,
            }))
          )
        );
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  async function updateOrganization(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    dataSource.manager
      .transaction(async (entityManager) => {
        const organizationRepo =
          repoProvider.getOrganizationRepo(entityManager);
        const organizationIdParam: number = Number(req.params.id);
        const organizationRequest = OrganizationRequestSchema.parse(req.body);
        const organization = await organizationRepo.findByIdOrFail(
          organizationIdParam
        );
        checkIfCurrentUserIsMember(req, organization);
        const updatedOrganization = await organizationRepo.save(
          organization
            .rename(organizationRequest.name)
            .updateAddress(organizationRequest.address)
        );

        res.json(OrganizationResponseSchema.parse(updatedOrganization));
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  return deepFreeze({
    createOrganization,
    updateOrganization,
    getOrganization,
    inviteUser,
    getOrganizationsOfCurrentUser,
  });
}

export class OldOrganizationService {
  constructor(
    private dataSource: DataSource,
    private oldRepoProvider: IOldRepoProvider
  ) {}

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
          this.oldRepoProvider.getOrganizationEntityRepo(entityManager);
        const organizationEntity = await organizationEntityRepo.findByIdOrFail(
          Number(req.params.id),
          true
        );
        Authorization.checkIfCurrentUserIsMember(req, organizationEntity);
        res.json(
          BalanceSheetItemsResponseSchema.parse(
            organizationEntity.balanceSheetEntities
              ? organizationEntity.balanceSheetEntities
                  .map((b) => ({
                    id: b.id,
                  }))
                  .sort((a, b) => a.id! - b.id!)
              : []
          )
        );
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
          this.oldRepoProvider.getBalanceSheetEntityRepo(entityManager);
        const orgaRepo =
          this.oldRepoProvider.getOrganizationEntityRepo(entityManager);

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
