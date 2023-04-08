import { NextFunction, Request, Response } from 'express';
import {
  BALANCE_SHEET_RELATIONS,
  BalanceSheetEntity,
  createFromBalanceSheet,
} from '../entities/balance.sheet.entity';
import { Connection, EntityManager } from 'typeorm';
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

export class BalanceSheetService {
  constructor(private connection: Connection) {}

  public async createBalanceSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const saveFlag = this.parseSaveFlag(req.query.save);
    const language = parseLanguageParameter(req.query.lng);
    this.connection.manager
      .transaction(async (entityManager) => {
        const foundUser = await Authorization.findCurrentUserOrFail(
          req,
          entityManager
        );
        const balanceSheet = BalanceSheetParser.fromJson(req.body);

        const { updatedBalanceSheet } = await Calc.calculate(balanceSheet);

        const balanceSheetId = saveFlag
          ? await this.saveBalanceSheet(
              undefined,
              entityManager,
              updatedBalanceSheet,
              foundUser
            )
          : undefined;

        res.json(
          BalanceSheetParser.toJson(
            balanceSheetId,
            updatedBalanceSheet,
            language
          )
        );
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
    this.connection.manager
      .transaction(async (entityManager) => {
        if (req.file) {
          const foundUser = await Authorization.findCurrentUserOrFail(
            req,
            entityManager
          );
          const wb = await new Workbook().xlsx.load(req.file.buffer);
          const balanceSheetReader = new BalanceSheetReader();

          const balanceSheet = balanceSheetReader.readFromWorkbook(wb);

          const { updatedBalanceSheet } = await Calc.calculate(balanceSheet);

          const balanceSheetId = saveFlag
            ? await this.saveBalanceSheet(
                undefined,
                entityManager,
                updatedBalanceSheet,
                foundUser
              )
            : undefined;

          res.json(
            BalanceSheetParser.toJson(
              balanceSheetId,
              updatedBalanceSheet,
              language
            )
          );
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
    this.connection.manager
      .transaction(async (entityManager) => {
        const balanceSheetRepository =
          entityManager.getRepository(BalanceSheetEntity);
        const entityWithDTOMerger = new EntityWithDtoMerger();
        const balanceSheetIdParam: number = Number(req.params.id);
        const balanceSheetEntity = await balanceSheetRepository.findOneOrFail({
          where: { id: balanceSheetIdParam },
          relations: BALANCE_SHEET_RELATIONS,
        });
        await Authorization.isGrantedForCurrentUserOrFail(
          req,
          balanceSheetEntity,
          entityManager
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
        const balanceSheetId = await this.saveBalanceSheet(
          balanceSheetEntity.id,
          entityManager,
          updatedBalanceSheet,
          balanceSheetEntity.users[0]
        );

        res.json(
          BalanceSheetParser.toJson(
            balanceSheetId,
            updatedBalanceSheet,
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
    this.connection.manager
      .transaction(async (entityManager) => {
        if (!req.userInfo) {
          throw new NoAccessError();
        }
        const userRepository = entityManager.getRepository(User);
        const user = await userRepository.findOneOrFail({
          where: { id: req.userInfo.id },
          relations: ['balanceSheetEntities'],
        });
        res.json(
          BalanceSheetItemsResponseSchema.parse(
            user.balanceSheetEntities.map((b) => {
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
    this.connection.manager
      .transaction(async (entityManager) => {
        const balanceSheetRepository =
          entityManager.getRepository(BalanceSheetEntity);
        const balanceSheetId: number = Number(req.params.id);
        const balanceSheetEntity = await balanceSheetRepository.findOneOrFail({
          where: { id: balanceSheetId },
          relations: BALANCE_SHEET_RELATIONS,
        });
        await Authorization.isGrantedForCurrentUserOrFail(
          req,
          balanceSheetEntity,
          entityManager
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
    this.connection.manager
      .transaction(async (entityManager) => {
        const balanceSheetRepository =
          entityManager.getRepository(BalanceSheetEntity);
        const balanceSheetId: number = Number(req.params.id);
        const balanceSheetEntity = await balanceSheetRepository.findOneOrFail({
          where: { id: balanceSheetId },
          relations: BALANCE_SHEET_RELATIONS,
        });
        await Authorization.isGrantedForCurrentUserOrFail(
          req,
          balanceSheetEntity,
          entityManager
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
    this.connection.manager
      .transaction(async (entityManager) => {
        const balanceSheetId: number = Number(req.params.id);
        const balanceSheetRepository =
          entityManager.getRepository(BalanceSheetEntity);
        const balanceSheetEntity = await balanceSheetRepository.findOneOrFail({
          where: { id: balanceSheetId },
          relations: BALANCE_SHEET_RELATIONS,
        });
        await Authorization.isGrantedForCurrentUserOrFail(
          req,
          balanceSheetEntity,
          entityManager
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

  private async saveBalanceSheet(
    balanceSheetId: number | undefined,
    entityManager: EntityManager,
    balanceSheet: BalanceSheet,
    user: User
  ) {
    return (
      await entityManager
        .getRepository(BalanceSheetEntity)
        .save(createFromBalanceSheet(balanceSheetId, balanceSheet, [user]))
    ).id;
  }

  private parseSaveFlag(saveParam: any): boolean {
    return !(
      saveParam !== undefined &&
      typeof saveParam === 'string' &&
      saveParam.toLowerCase() === 'false'
    );
  }
}
