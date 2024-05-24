import { NextFunction, Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { handle } from '../exceptions/error.handler';
import { BalanceSheetPatchRequestBodySchema } from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import { parseLanguageParameter } from '../language/translations';
import { checkIfCurrentUserHasEditorPermissions } from '../security/authorization';
import { IRepoProvider } from '../repositories/repo.provider';
import deepFreeze from 'deep-freeze';
import { makeBalanceSheet } from '../models/balance.sheet';

export interface IBalanceSheetService {
  createBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  updateBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  getBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  deleteBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  getMatrixRepresentationOfBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}

export function makeBalanceSheetService(
  dataSource: DataSource,
  repoProvider: IRepoProvider
): IBalanceSheetService {
  async function createBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const balanceSheet = makeBalanceSheet.fromJson(req.body);
      const language = parseLanguageParameter(req.query.lng);
      res.json((await balanceSheet.reCalculate()).toJson(language));
    } catch (error: any) {
      handle(error, next);
    }
  }

  async function updateBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const language = parseLanguageParameter(req.query.lng);
    dataSource.manager
      .transaction(async (entityManager) => {
        const balanceSheetRepository =
          repoProvider.getBalanceSheetRepo(entityManager);

        const balanceSheetIdParam: number = Number(req.params.id);
        const balanceSheet = await balanceSheetRepository.findByIdOrFail(
          balanceSheetIdParam
        );
        await checkIfCurrentUserHasEditorPermissions(
          req,
          repoProvider.getOrganizationRepo(entityManager),
          balanceSheet
        );

        const updatedBalanceSheet = await balanceSheetRepository.save(
          await balanceSheet
            .merge(BalanceSheetPatchRequestBodySchema.parse(req.body))
            .reCalculate()
        );

        res.json(updatedBalanceSheet.toJson(language));
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  async function getBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const language = parseLanguageParameter(req.query.lng);
    dataSource.manager
      .transaction(async (entityManager) => {
        const balanceSheetRepository =
          repoProvider.getBalanceSheetRepo(entityManager);
        const balanceSheetEntity = await balanceSheetRepository.findByIdOrFail(
          Number(req.params.id)
        );
        await checkIfCurrentUserHasEditorPermissions(
          req,
          repoProvider.getOrganizationRepo(entityManager),
          balanceSheetEntity
        );
        res.json(balanceSheetEntity.toJson(language));
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  async function deleteBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    dataSource.manager
      .transaction(async (entityManager) => {
        const balanceSheetId: number = Number(req.params.id);
        const balanceSheetRepository =
          repoProvider.getBalanceSheetRepo(entityManager);
        const balanceSheet = await balanceSheetRepository.findByIdOrFail(
          balanceSheetId
        );
        await checkIfCurrentUserHasEditorPermissions(
          req,
          repoProvider.getOrganizationRepo(entityManager),
          balanceSheet
        );
        await balanceSheetRepository.remove(balanceSheet);

        res.json({
          message: `Deleted balance sheet with id ${balanceSheetId}`,
        });
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  async function getMatrixRepresentationOfBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const language = parseLanguageParameter(req.query.lng);
    dataSource.manager
      .transaction(async (entityManager) => {
        const balanceSheetRepository =
          repoProvider.getBalanceSheetRepo(entityManager);
        const balanceSheetId: number = Number(req.params.id);
        const balanceSheet = await balanceSheetRepository.findByIdOrFail(
          balanceSheetId
        );
        await checkIfCurrentUserHasEditorPermissions(
          req,
          repoProvider.getOrganizationRepo(entityManager),
          balanceSheet
        );

        res.json(balanceSheet.asMatrixRepresentation(language));
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  return deepFreeze({
    createBalanceSheet,
    updateBalanceSheet,
    getBalanceSheet,
    deleteBalanceSheet,
    getMatrixRepresentationOfBalanceSheet,
  });
}
