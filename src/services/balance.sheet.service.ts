import { NextFunction, Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { EntityWithDtoMerger } from '../merge/entity.with.dto.merger';
import { handle } from '../exceptions/error.handler';
import { User } from '../entities/user';
import { NoAccessError } from '../exceptions/no.access.error';
import { Workbook } from 'exceljs';
import { BalanceSheetReader } from '../reader/balanceSheetReader/balance.sheet.reader';

import { CalcResultsReader } from '../reader/balanceSheetReader/calc.results.reader';
import { diff } from 'deep-diff';
import { TopicWeightsReader } from '../reader/balanceSheetReader/topic.weights.reader';
import { StakeholderWeightsReader } from '../reader/balanceSheetReader/stakeholder.weights.reader';
import {
  BalanceSheet,
  BalanceSheetParser,
  balanceSheetToMatrixResponse,
  diffBetweenBalanceSheets,
} from '../models/balance.sheet';

import {
  parseLanguageParameter,
  translateBalanceSheet,
} from '../language/translations';
import {
  BalanceSheetItemsResponseSchema,
  BalanceSheetPatchRequestBodySchema,
} from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import { BalanceSheetExcelDiffResponseBody } from '@ecogood/e-calculator-schemas/dist/balance.sheet.diff';
import { Authorization } from '../security/authorization';
import { Calc } from './calculation.service';
import { IRepoProvider } from '../repositories/repo.provider';
import { IBalanceSheetEntityRepo } from '../repositories/balance.sheet.entity.repo';

export class BalanceSheetService {
  constructor(
    private dataSource: DataSource,
    private repoProvider: IRepoProvider
  ) {}

  public async createBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const saveFlag = this.parseSaveFlag(req.query.save);
    const language = parseLanguageParameter(req.query.lng);
    this.dataSource.manager
      .transaction(async (entityManager) => {
        const userRepo = this.repoProvider.getUserEntityRepo(entityManager);
        const balanceSheetRepo =
          this.repoProvider.getBalanceSheetEntityRepo(entityManager);
        const foundUser = await userRepo.findCurrentUserOrFail(req);
        const balanceSheet = BalanceSheetParser.fromJson(req.body);

        const { updatedBalanceSheet } = await Calc.calculate(balanceSheet);

        const { id, savedBalanceSheet } =
          await this.saveBalanceSheetIfRequested(
            saveFlag,
            updatedBalanceSheet,
            [foundUser],
            balanceSheetRepo
          );

        res.json(BalanceSheetParser.toJson(id, savedBalanceSheet, language));
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  public async diffBetweenUploadApiBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (req.file) {
        const wb = await new Workbook().xlsx.load(req.file.buffer);
        const balanceSheetReader = new BalanceSheetReader();
        const calcResultsReader = new CalcResultsReader();
        const topicWeightsReader = new TopicWeightsReader();
        const stakeholderWeightsReader = new StakeholderWeightsReader();

        const balanceSheetUpload = balanceSheetReader.readFromWorkbook(wb);
        const calcResultsUpload = calcResultsReader.readFromWorkbook(wb);
        const stakeholderWeightsUpload =
          stakeholderWeightsReader.readFromWorkbook(wb);
        const topicWeightsUpload = topicWeightsReader.readFromWorkbook(wb);

        const {
          updatedBalanceSheet,
          calcResults,
          stakeholderWeights,
          topicWeights,
        } = await Calc.calculate(balanceSheetUpload);

        res.json(
          BalanceSheetExcelDiffResponseBody.parse({
            lhs: 'upload',
            rhs: 'api',
            diffStakeHolderWeights:
              stakeholderWeightsUpload &&
              diff(
                Object.fromEntries(stakeholderWeightsUpload),
                Object.fromEntries(stakeholderWeights)
              ),
            diffTopicWeights:
              topicWeightsUpload &&
              diff(
                Object.fromEntries(topicWeightsUpload),
                Object.fromEntries(topicWeights)
              ),
            diffCalc: calcResultsUpload && diff(calcResultsUpload, calcResults),
            diff: diffBetweenBalanceSheets(
              balanceSheetUpload,
              updatedBalanceSheet
            ),
          })
        );
      } else {
        res.json({ message: 'File empty' });
      }
    } catch (error) {
      handle(error as Error, next);
    }
  }

  public async uploadBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const language = parseLanguageParameter(req.query.lng);
    const saveFlag = this.parseSaveFlag(req.query.save);
    this.dataSource.manager
      .transaction(async (entityManager) => {
        if (req.file) {
          const userRepo = this.repoProvider.getUserEntityRepo(entityManager);
          const foundUser = await userRepo.findCurrentUserOrFail(req);
          const wb = await new Workbook().xlsx.load(req.file.buffer);
          const balanceSheetReader = new BalanceSheetReader();
          const balanceSheetRepo =
            this.repoProvider.getBalanceSheetEntityRepo(entityManager);
          const balanceSheet = balanceSheetReader.readFromWorkbook(wb);

          const { updatedBalanceSheet } = await Calc.calculate(balanceSheet);

          const { id, savedBalanceSheet } =
            await this.saveBalanceSheetIfRequested(
              saveFlag,
              updatedBalanceSheet,
              [foundUser],
              balanceSheetRepo
            );
          res.json(BalanceSheetParser.toJson(id, savedBalanceSheet, language));
        } else {
          res.json({ message: 'File empty' });
        }
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  public async updateBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const language = parseLanguageParameter(req.query.lng);
    this.dataSource.manager
      .transaction(async (entityManager) => {
        const balanceSheetRepository =
          this.repoProvider.getBalanceSheetEntityRepo(entityManager);
        const entityWithDTOMerger = new EntityWithDtoMerger();
        const balanceSheetIdParam: number = Number(req.params.id);
        const balanceSheetEntity = await balanceSheetRepository.findByIdOrFail(
          balanceSheetIdParam
        );
        await Authorization.checkBalanceSheetPermissionForCurrentUser(
          req,
          balanceSheetEntity,
          this.repoProvider.getUserEntityRepo(entityManager)
        );
        const balanceSheetPatchRequestBody =
          BalanceSheetPatchRequestBodySchema.parse(req.body);
        const mergedBalanceSheet = entityWithDTOMerger.mergeBalanceSheet(
          balanceSheetEntity.toBalanceSheet(),
          balanceSheetPatchRequestBody
        );
        const { updatedBalanceSheet } = await Calc.calculate(
          mergedBalanceSheet
        );
        const savedBalanceSheetEntity =
          await balanceSheetRepository.saveBalanceSheet(
            balanceSheetEntity.id,
            updatedBalanceSheet,
            balanceSheetEntity.users
          );

        res.json(
          BalanceSheetParser.toJson(
            savedBalanceSheetEntity.id,
            savedBalanceSheetEntity.toBalanceSheet(),
            language
          )
        );
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  public async getBalanceSheetsOfUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    this.dataSource.manager
      .transaction(async (entityManager) => {
        if (!req.userInfo) {
          throw new NoAccessError();
        }
        const balanceSheetEntityRepo =
          this.repoProvider.getBalanceSheetEntityRepo(entityManager);
        const balanceSheetEntities =
          await balanceSheetEntityRepo.findBalanceSheetsOfUser(req.userInfo.id);
        res.json(
          BalanceSheetItemsResponseSchema.parse(
            balanceSheetEntities.map((b) => {
              return { id: b.id };
            })
          )
        );
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  public async getBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const language = parseLanguageParameter(req.query.lng);
    this.dataSource.manager
      .transaction(async (entityManager) => {
        const balanceSheetRepository =
          this.repoProvider.getBalanceSheetEntityRepo(entityManager);
        const balanceSheetId: number = Number(req.params.id);
        const balanceSheetEntity = await balanceSheetRepository.findByIdOrFail(
          balanceSheetId
        );
        await Authorization.checkBalanceSheetPermissionForCurrentUser(
          req,
          balanceSheetEntity,
          this.repoProvider.getUserEntityRepo(entityManager)
        );
        res.json(
          BalanceSheetParser.toJson(
            balanceSheetEntity.id,
            balanceSheetEntity.toBalanceSheet(),
            language
          )
        );
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  public async getMatrixRepresentationOfBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const language = parseLanguageParameter(req.query.lng);
    this.dataSource.manager
      .transaction(async (entityManager) => {
        const balanceSheetRepository =
          this.repoProvider.getBalanceSheetEntityRepo(entityManager);
        const balanceSheetId: number = Number(req.params.id);
        const balanceSheetEntity = await balanceSheetRepository.findByIdOrFail(
          balanceSheetId
        );
        await Authorization.checkBalanceSheetPermissionForCurrentUser(
          req,
          balanceSheetEntity,
          this.repoProvider.getUserEntityRepo(entityManager)
        );

        res.json(
          balanceSheetToMatrixResponse(
            translateBalanceSheet(balanceSheetEntity.toBalanceSheet(), language)
          )
        );
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  public async deleteBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    this.dataSource.manager
      .transaction(async (entityManager) => {
        const balanceSheetId: number = Number(req.params.id);
        const balanceSheetRepository =
          this.repoProvider.getBalanceSheetEntityRepo(entityManager);
        const balanceSheetEntity = await balanceSheetRepository.findByIdOrFail(
          balanceSheetId
        );
        await Authorization.checkBalanceSheetPermissionForCurrentUser(
          req,
          balanceSheetEntity,
          this.repoProvider.getUserEntityRepo(entityManager)
        );
        await balanceSheetRepository.remove(balanceSheetEntity);

        res.json({
          message: `Deleted balance sheet with id ${balanceSheetId}`,
        });
      })
      .catch((error) => {
        handle(error, next);
      });
  }

  private async saveBalanceSheetIfRequested(
    saveFlag: boolean,
    balanceSheet: BalanceSheet,
    users: User[],
    balanceSheetRepo: IBalanceSheetEntityRepo
  ): Promise<{ id: number | undefined; savedBalanceSheet: BalanceSheet }> {
    if (saveFlag) {
      const balanceSheetEntity = await balanceSheetRepo.saveBalanceSheet(
        undefined,
        balanceSheet,
        users
      );
      return {
        id: balanceSheetEntity.id,
        savedBalanceSheet: balanceSheetEntity.toBalanceSheet(),
      };
    }
    return { id: undefined, savedBalanceSheet: balanceSheet };
  }

  private parseSaveFlag(saveParam: any): boolean {
    return !(
      saveParam !== undefined &&
      typeof saveParam === 'string' &&
      saveParam.toLowerCase() === 'false'
    );
  }
}
