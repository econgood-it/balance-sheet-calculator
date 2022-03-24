import { Request, Response, NextFunction } from 'express';
import { BalanceSheetDTOCreate } from '../dto/create/balance.sheet.create.dto';
import {
  BALANCE_SHEET_RELATIONS,
  BalanceSheet,
} from '../entities/balanceSheet';
import { Connection } from 'typeorm';
import { BalanceSheetDTOUpdate } from '../dto/update/balance.sheet.update.dto';
import { SupplyFraction } from '../entities/supplyFraction';
import { EmployeesFraction } from '../entities/employeesFraction';
import { EntityWithDtoMerger } from '../merge/entity.with.dto.merger';
import { validateOrReject } from 'class-validator';
import { IndustrySector } from '../entities/industry.sector';
import { MatrixDTO } from '../dto/matrix/matrix.dto';
import { CompanyFacts } from '../entities/companyFacts';
import { BalanceSheetDTOResponse } from '../dto/response/balance.sheet.response.dto';
import { parseLanguageParameter } from '../entities/Translations';
import { handle } from '../exceptions/error.handler';
import { User } from '../entities/user';
import { AccessCheckerService } from './access.checker.service';
import { CalculationService } from './calculation.service';
import UnauthorizedException from '../exceptions/unauthorized.exception';
import { NoAccessError } from '../exceptions/no.access.error';

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
        if (req.userInfo === undefined) {
          throw new UnauthorizedException('No user provided');
        }
        const userId = req.userInfo.id;
        const userRepository = entityManager.getRepository(User);
        const foundUser = await userRepository.findOneOrFail(userId);
        const balanceSheet: BalanceSheet =
          await balanceSheetDTOCreate.toBalanceSheet(language, [foundUser]);
        const balanceSheetResponse: BalanceSheet =
          await CalculationService.calculate(
            balanceSheet,
            entityManager,
            saveFlag
          );
        res.json(
          BalanceSheetDTOResponse.fromBalanceSheet(
            balanceSheetResponse,
            language
          )
        );
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
          entityManager.getRepository(BalanceSheet);
        const entityWithDTOMerger = new EntityWithDtoMerger(
          entityManager.getRepository(SupplyFraction),
          entityManager.getRepository(EmployeesFraction),
          entityManager.getRepository(IndustrySector)
        );
        const balanceSheetId: number = Number(req.params.id);
        const balanceSheet = await balanceSheetRepository.findOneOrFail(
          balanceSheetId,
          {
            relations: BALANCE_SHEET_RELATIONS,
          }
        );
        await AccessCheckerService.check(req, balanceSheet, entityManager);
        const balanceSheetDTOUpdate: BalanceSheetDTOUpdate =
          BalanceSheetDTOUpdate.fromJSON(req.body);
        await this.validateOrFail(balanceSheetDTOUpdate);
        await entityWithDTOMerger.mergeBalanceSheet(
          balanceSheet,
          balanceSheetDTOUpdate,
          language
        );
        const balanceSheetResponse: BalanceSheet =
          await CalculationService.calculate(balanceSheet, entityManager, true);
        res.json(
          BalanceSheetDTOResponse.fromBalanceSheet(
            balanceSheetResponse,
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
        const user = await userRepository.findOneOrFail(req.userInfo.id, {
          relations: ['balanceSheets'],
        });
        res.json(
          user.balanceSheets.map((b) => {
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
          entityManager.getRepository(BalanceSheet);
        const balanceSheetId: number = Number(req.params.id);
        const balanceSheet = await balanceSheetRepository.findOneOrFail(
          balanceSheetId,
          {
            relations: BALANCE_SHEET_RELATIONS,
          }
        );
        await AccessCheckerService.check(req, balanceSheet, entityManager);
        balanceSheet.sortRatings();
        res.json(
          BalanceSheetDTOResponse.fromBalanceSheet(balanceSheet, language)
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
          entityManager.getRepository(BalanceSheet);
        const balanceSheetId: number = Number(req.params.id);
        const balanceSheet = await balanceSheetRepository.findOneOrFail(
          balanceSheetId,
          {
            relations: BALANCE_SHEET_RELATIONS,
          }
        );
        await AccessCheckerService.check(req, balanceSheet, entityManager);
        balanceSheet.sortRatings();
        res.json(MatrixDTO.fromBalanceSheet(balanceSheet, language));
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
          entityManager.getRepository(BalanceSheet);
        const companyFactsRepository =
          entityManager.getRepository(CompanyFacts);
        const balanceSheet = await balanceSheetRepository.findOneOrFail(
          balanceSheetId,
          {
            relations: BALANCE_SHEET_RELATIONS,
          }
        );
        await AccessCheckerService.check(req, balanceSheet, entityManager);
        await companyFactsRepository.remove(balanceSheet.companyFacts);
        await balanceSheetRepository.remove(balanceSheet);

        res.json({
          message: `Deleted balance sheet with id ${balanceSheetId}`,
        });
      })
      .catch((error) => {
        handle(error, next);
      });
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
