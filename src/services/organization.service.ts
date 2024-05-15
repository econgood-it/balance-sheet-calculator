import { NextFunction, Request, Response } from 'express';

import { BalanceSheetItemsResponseSchema } from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import {
  OrganizationItemsResponseSchema,
  OrganizationRequestSchema,
  OrganizationResponseSchema,
} from '@ecogood/e-calculator-schemas/dist/organization.dto';
import { DataSource } from 'typeorm';
import { handle } from '../exceptions/error.handler';
import { NoAccessError } from '../exceptions/no.access.error';
import NotFoundException from '../exceptions/not.found.exception';
import { parseLanguageParameter } from '../language/translations';
import { checkIfCurrentUserIsMember } from '../security/authorization';
import { z } from 'zod';
import { IRepoProvider } from '../repositories/repo.provider';
import { makeOrganization } from '../models/organization';
import deepFreeze from 'deep-freeze';
import { makeBalanceSheet } from '../models/balance.sheet';

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
  createBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  getBalanceSheets(
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

  async function createBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const balanceSheet = makeBalanceSheet.fromJson(req.body);
    const language = parseLanguageParameter(req.query.lng);
    dataSource.manager
      .transaction(async (entityManager) => {
        const balanceSheetRepo =
          repoProvider.getBalanceSheetRepo(entityManager);
        const orgaRepo = repoProvider.getOrganizationRepo(entityManager);

        const organization = await orgaRepo.findByIdOrFail(
          Number(req.params.id)
        );
        if (!organization) {
          throw new NotFoundException('Organization not found');
        }
        checkIfCurrentUserIsMember(req, organization);

        const createdBalanceSheet = await balanceSheetRepo.save(
          await balanceSheet.assignOrganization(organization).reCalculate()
        );

        res.json(createdBalanceSheet.toJson(language));
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  async function getBalanceSheets(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    dataSource.manager
      .transaction(async (entityManager) => {
        const organizationRepo =
          repoProvider.getOrganizationRepo(entityManager);
        const balanceSheetRepo =
          repoProvider.getBalanceSheetRepo(entityManager);
        const organization = await organizationRepo.findByIdOrFail(
          Number(req.params.id)
        );

        checkIfCurrentUserIsMember(req, organization);
        const balanceSheets = await balanceSheetRepo.findByOrganization(
          organization
        );
        res.json(
          BalanceSheetItemsResponseSchema.parse(
            balanceSheets
              .map((b) => ({
                id: b.id,
              }))
              .sort((a, b) => a.id! - b.id!)
          )
        );
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
    createBalanceSheet,
    getBalanceSheets,
  });
}
