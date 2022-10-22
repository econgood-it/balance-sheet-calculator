import { NextFunction, Request, Response } from 'express';
import { BalanceSheetDTOCreate } from '../dto/create/balance.sheet.create.dto';
import {
  BALANCE_SHEET_RELATIONS,
  BalanceSheetEntity,
  createFromBalanceSheet,
} from '../entities/balance.sheet.entity';
import { Connection, EntityManager } from 'typeorm';
import { BalanceSheetDTOUpdate } from '../dto/update/balance.sheet.update.dto';
import { EntityWithDtoMerger } from '../merge/entity.with.dto.merger';
import { validateOrReject } from 'class-validator';
import { MatrixDTO } from '../dto/matrix/matrix.dto';
import { BalanceSheetDTOResponse } from '../dto/response/balance.sheet.response.dto';
import { parseLanguageParameter } from '../entities/Translations';
import { handle } from '../exceptions/error.handler';
import { User } from '../entities/user';
import { AccessCheckerService } from './access.checker.service';
import { CalculationService } from './calculation.service';
import UnauthorizedException from '../exceptions/unauthorized.exception';
import { NoAccessError } from '../exceptions/no.access.error';
import { Workbook } from 'exceljs';
import {
  BalanceSheetReader,
  readLanguage,
} from '../reader/balanceSheetReader/balance.sheet.reader';
import { diffBetweenBalanceSheets } from '../dto/response/balance.sheet.diff.response';
import { CalcResultsReader } from '../reader/balanceSheetReader/calc.results.reader';
import { diff } from 'deep-diff';
import { TopicWeightsReader } from '../reader/balanceSheetReader/topic.weights.reader';
import { StakeholderWeightsReader } from '../reader/balanceSheetReader/stakeholder.weights.reader';
import { BalanceSheet } from '../models/balance.sheet';

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
        const balanceSheetDTOCreate: BalanceSheetDTOCreate =
          BalanceSheetDTOCreate.fromJSON(req.body);
        await this.validateOrFail(balanceSheetDTOCreate);
        const foundUser = await this.findUserOrFail(req, entityManager);
        const balanceSheet = await balanceSheetDTOCreate.toBalanceSheet();
        const { updatedBalanceSheet } = await CalculationService.calculate(
          balanceSheet
        );

        const balanceSheetId = saveFlag
          ? await this.saveBalanceSheet(
              entityManager,
              updatedBalanceSheet,
              foundUser
            )
          : undefined;

        res.json(
          BalanceSheetDTOResponse.fromBalanceSheet(
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
        } = await CalculationService.calculate(balanceSheetUpload);

        res.json({
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
        });
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
    const saveFlag = this.parseSaveFlag(req.query.save);
    this.connection.manager
      .transaction(async (entityManager) => {
        if (req.file) {
          const foundUser = await this.findUserOrFail(req, entityManager);
          const wb = await new Workbook().xlsx.load(req.file.buffer);
          const language = readLanguage(wb);
          const balanceSheetReader = new BalanceSheetReader();

          const balanceSheet = balanceSheetReader.readFromWorkbook(wb);

          const { updatedBalanceSheet } = await CalculationService.calculate(
            balanceSheet
          );

          const balanceSheetId = saveFlag
            ? await this.saveBalanceSheet(
                entityManager,
                updatedBalanceSheet,
                foundUser
              )
            : undefined;

          res.json(
            BalanceSheetDTOResponse.fromBalanceSheet(
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
        await AccessCheckerService.check(
          req,
          balanceSheetEntity,
          entityManager
        );
        const balanceSheetDTOUpdate: BalanceSheetDTOUpdate =
          BalanceSheetDTOUpdate.fromJSON(req.body);
        await this.validateOrFail(balanceSheetDTOUpdate);
        const mergedBalanceSheet = entityWithDTOMerger.mergeBalanceSheet(
          balanceSheetEntity.toBalanceSheet(),
          balanceSheetDTOUpdate
        );
        const { updatedBalanceSheet } = await CalculationService.calculate(
          mergedBalanceSheet
        );
        const balanceSheetId = await this.saveBalanceSheet(
          entityManager,
          updatedBalanceSheet,
          balanceSheetEntity.users[0]
        );

        res.json(
          BalanceSheetDTOResponse.fromBalanceSheet(
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
          relations: ['balanceSheets'],
        });
        res.json(
          user.balanceSheetEntities.map((b) => {
            return { id: b.id };
          })
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
        await AccessCheckerService.check(
          req,
          balanceSheetEntity,
          entityManager
        );
        res.json(
          BalanceSheetDTOResponse.fromBalanceSheet(
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
        await AccessCheckerService.check(
          req,
          balanceSheetEntity,
          entityManager
        );

        res.json(
          MatrixDTO.fromBalanceSheet(
            balanceSheetEntity.toBalanceSheet(),
            language
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
        await AccessCheckerService.check(
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
    entityManager: EntityManager,
    balanceSheet: BalanceSheet,
    user: User
  ) {
    return (
      await entityManager
        .getRepository(BalanceSheetEntity)
        .save(createFromBalanceSheet(balanceSheet, [user]))
    ).id;
  }

  private async findUserOrFail(req: Request, entityManager: EntityManager) {
    if (req.userInfo === undefined) {
      throw new UnauthorizedException('No user provided');
    }
    const userId = req.userInfo.id;
    const userRepository = entityManager.getRepository(User);
    return await userRepository.findOneOrFail({ where: { id: userId } });
  }

  private async validateOrFail(
    balanceSheet: BalanceSheetDTOCreate | BalanceSheetDTOUpdate
  ) {
    await validateOrReject(balanceSheet, {
      validationError: { target: false },
    });
  }

  private parseSaveFlag(saveParam: any): boolean {
    return !(
      saveParam !== undefined &&
      typeof saveParam === 'string' &&
      saveParam.toLowerCase() === 'false'
    );
  }
}
