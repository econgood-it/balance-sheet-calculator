import { Request, Response, NextFunction } from "express";
import { BalanceSheetDTOCreate } from "../dto/create/balance.sheet.create.dto";
import { BalanceSheet } from "../entities/balanceSheet";
import InternalServerException from "../exceptions/internal.server.exception";
import {Connection, EntityManager, EntityNotFoundError} from "typeorm";
import { BalanceSheetDTOUpdate } from "../dto/update/balance.sheet.update.dto";
import { TopicUpdater } from "../calculations/topic.updater";
import { SupplyFraction } from "../entities/supplyFraction";
import { EmployeesFraction } from "../entities/employeesFraction";
import { EntityWithDtoMerger } from "../entities/entity.with.dto.merger";
import { JsonMappingError } from "@daniel-faber/json-ts";
import BadRequestException from "../exceptions/bad.request.exception";
import { Region } from "../entities/region";
import { validateOrReject, ValidationError } from 'class-validator';
import {CalcResults, Calculator} from "../calculations/calculator";
import {Industry} from "../entities/industry";
import {IndustrySector} from "../entities/industry.sector";
import {RegionProvider} from "../providers/region.provider";
import {IndustryProvider} from "../providers/industry.provider";
import {MatrixDTO} from "../dto/matrix/matrix.dto";
import NotFoundException from "../exceptions/not.found.exception";
import {CompanyFacts} from "../entities/companyFacts";
import {Rating} from "../entities/rating";
import {BalanceSheetDTOResponse} from "../dto/response/balance.sheet.response.dto";
import {parseLanguageParameter} from "../entities/Translations";

export class BalanceSheetService {
  private static readonly BALANCE_SHEET_RELATIONS = ['rating', 'companyFacts',
    'companyFacts.supplyFractions', 'companyFacts.employeesFractions',
    'companyFacts.industrySectors', 'rating.topics', 'rating.topics.aspects'];
  private static readonly RATING_RELATIONS = ['rating','rating.topics', 'rating.topics.aspects'];

  constructor(private connection: Connection) {
  }

  public welcomeMessage(req: Request, res: Response) {
    return res.status(200).send("The Balance Sheet Calculator API is up and running");
  }

  public async createBalanceSheet(req: Request, res: Response, next: NextFunction) {
    const language = parseLanguageParameter(req.query.lng);
    this.connection.manager.transaction(async entityManager => {
      const balanceSheetDTOCreate: BalanceSheetDTOCreate = BalanceSheetDTOCreate.fromJSON(req.body);
      await this.validateOrFail(balanceSheetDTOCreate);
      const balanceSheet: BalanceSheet = await balanceSheetDTOCreate.toBalanceSheet(language);
      const balanceSheetResponse: BalanceSheet = await this.calculateAndSave(balanceSheet, entityManager);
      res.json(BalanceSheetDTOResponse.fromBalanceSheet(balanceSheetResponse, language));
    }).catch(error => {
      this.handleError(error, next);
    });
  }

  public async updateBalanceSheet(req: Request, res: Response, next: NextFunction) {
    const language = parseLanguageParameter(req.query.lng);
    this.connection.manager.transaction(async entityManager => {
      const balanceSheetRepository = entityManager.getRepository(BalanceSheet);
      const entityWithDTOMerger = new EntityWithDtoMerger(entityManager.getRepository(SupplyFraction),
        entityManager.getRepository(EmployeesFraction), entityManager.getRepository(IndustrySector));
      const balanceSheetId: number = Number(req.params.id);
      const balanceSheet = await balanceSheetRepository.findOneOrFail(balanceSheetId, {
        relations: BalanceSheetService.BALANCE_SHEET_RELATIONS
      });
      const balanceSheetDTOUpdate: BalanceSheetDTOUpdate = BalanceSheetDTOUpdate.fromJSON(req.body);
      if (balanceSheetDTOUpdate.id !== balanceSheetId) {
        next(new BadRequestException(`Balance sheet id in request body and url parameter has to be the same`));
      }
      await this.validateOrFail(balanceSheetDTOUpdate);
      await entityWithDTOMerger.mergeBalanceSheet(balanceSheet, balanceSheetDTOUpdate, language);
      const balanceSheetResponse: BalanceSheet = await this.calculateAndSave(balanceSheet, entityManager);
      res.json(BalanceSheetDTOResponse.fromBalanceSheet(balanceSheetResponse, language));
    }).catch(error => {
      this.handleError(error, next);
    });
  }

  public async getBalanceSheet(req: Request, res: Response, next: NextFunction) {
    const language = parseLanguageParameter(req.query.lng);
    this.connection.manager.transaction(async entityManager => {
      const balanceSheetRepository = entityManager.getRepository(BalanceSheet);
      const balanceSheetId: number = Number(req.params.id);
      const balanceSheet = await balanceSheetRepository.findOneOrFail(balanceSheetId, {
        relations: BalanceSheetService.BALANCE_SHEET_RELATIONS
      });
      this.sortArraysOfBalanceSheet(balanceSheet);
      res.json(BalanceSheetDTOResponse.fromBalanceSheet(balanceSheet, language));
    }).catch(error => {
      this.handleError(error, next);
    });
  }


  public async getMatrixRepresentationOfBalanceSheet(req: Request, res: Response, next: NextFunction) {
    const language = parseLanguageParameter(req.query.lng);
    this.connection.manager.transaction(async entityManager => {
      const balanceSheetRepository = entityManager.getRepository(BalanceSheet);
      const balanceSheetId: number = Number(req.params.id);
      const balanceSheet = await balanceSheetRepository.findOneOrFail(balanceSheetId, {
        relations: BalanceSheetService.RATING_RELATIONS
      });
      this.sortArraysOfBalanceSheet(balanceSheet);
      res.json(MatrixDTO.fromRating(balanceSheet.rating, language));
    }).catch(error => {
      this.handleError(error, next);
    });
  }

  public async deleteBalanceSheet(req: Request, res: Response, next: NextFunction) {
    this.connection.manager.transaction(async entityManager => {
      const balanceSheetId: number = Number(req.params.id);
      const balanceSheetRepository = entityManager.getRepository(BalanceSheet);
      const companyFactsRepository = entityManager.getRepository(CompanyFacts);
      const ratingRepository = entityManager.getRepository(Rating);
      const balanceSheet = await balanceSheetRepository.findOneOrFail(balanceSheetId, {
        relations: BalanceSheetService.BALANCE_SHEET_RELATIONS
      });
      await companyFactsRepository.remove(balanceSheet.companyFacts);
      await ratingRepository.remove(balanceSheet.rating);
      await balanceSheetRepository.remove(balanceSheet);

      res.json({'message': `Deleted balance sheet with id ${balanceSheetId}`});
    }).catch(error => {
      this.handleError(error, next);
    });
  }

  private handleError(error: Error, next: NextFunction) {
    if (error instanceof JsonMappingError) {
      next(new BadRequestException(error.message));
    }
    if (Array.isArray(error) && error.every(item => item instanceof ValidationError)) {
      next(new BadRequestException(error.toString()));
    }
    if (error instanceof EntityNotFoundError) {
      next(new NotFoundException(error.message));
    }
    next(new InternalServerException(error.message));
  }

  private async validateOrFail(balanceSheet: BalanceSheetDTOCreate | BalanceSheetDTOUpdate) {
    await validateOrReject(balanceSheet, {
      validationError: { target: false },
    });
  }

  private async calculateAndSave(balanceSheet: BalanceSheet, entityManager: EntityManager): Promise<BalanceSheet> {
    const industryRepository = entityManager.getRepository(Industry);
    const regionProvider = await RegionProvider.createFromCompanyFacts(balanceSheet.companyFacts,
      entityManager.getRepository(Region));
    const industryProvider = await IndustryProvider.createFromCompanyFacts(balanceSheet.companyFacts,
      industryRepository);
    const calcResults: CalcResults = await new Calculator(regionProvider, industryProvider).calculate(
      balanceSheet.companyFacts);
    const topicUpdater: TopicUpdater = new TopicUpdater();
    await topicUpdater.update(balanceSheet.rating.topics, balanceSheet.companyFacts, calcResults);
    const balanceSheetResponse: BalanceSheet = await entityManager.getRepository(BalanceSheet).save(balanceSheet);
    this.sortArraysOfBalanceSheet(balanceSheetResponse);
    return balanceSheetResponse;
  }

  private sortArraysOfBalanceSheet(balanceSheet: BalanceSheet) {
    balanceSheet.rating.topics.sort((t1, t2) => t1.shortName.localeCompare(t2.shortName));
    balanceSheet.rating.topics.forEach(t =>
      t.aspects.sort((a1, a2) => a1.shortName.localeCompare(a2.shortName))
    );
  }
}
