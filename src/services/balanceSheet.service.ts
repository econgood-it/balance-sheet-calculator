import { Request, Response, NextFunction } from "express";
import { LoggingService } from "../logging";
import { BalanceSheetDTOCreate } from "../dto/create/balanceSheetCreate.dto";
import { BalanceSheet } from "../entities/balanceSheet";
import InternalServerException from "../exceptions/InternalServerException";
import { Connection } from "typeorm";
import { BalanceSheetDTOUpdate } from "../dto/update/balanceSheetUpdate.dto";
import { MaxPointsCalculator } from "../calculations/MaxPointsCalculator";
import { SupplyFraction } from "../entities/supplyFraction";
import { EmployeesFraction } from "../entities/employeesFraction";
import { EntityWithDTOMerger } from "../entities/entityWithDTOMerger";
import { JsonMappingError } from "@daniel-faber/json-ts";
import BadRequestException from "../exceptions/BadRequestException";
import { Region } from "../entities/region";
import { BalanceSheetType } from "../entities/enums";
import { validateOrReject, ValidationError } from 'class-validator';
import {Precalculations, Precalculator} from "../calculations/precalculator";
import {Industry} from "../entities/industry";



export class BalanceSheetService {


  constructor(private connection: Connection) {
  }

  public welcomeMessage(req: Request, res: Response) {
    return res.status(200).send("The Balance Sheet Calculator API is up and running");
  }

  public async createBalanceSheet(req: Request, res: Response, next: NextFunction) {
    this.connection.manager.transaction(async entityManager => {
      const balanceSheetDTOCreate: BalanceSheetDTOCreate = BalanceSheetDTOCreate.fromJSON(req.body);
      await validateOrReject(balanceSheetDTOCreate, {
        validationError: { target: false },
      });
      const balancesheet: BalanceSheet = await balanceSheetDTOCreate.toBalanceSheet();
      const precalculations: Precalculations = await new Precalculator(entityManager.getRepository(Region),
        entityManager.getRepository(Industry)).calculate(balancesheet.companyFacts);
      const maxPointsCalculator: MaxPointsCalculator = new MaxPointsCalculator();
      await maxPointsCalculator.updateMaxPointsAndPoints(balancesheet.rating.topics, precalculations);
      const balanceSheetResponse: BalanceSheet = await entityManager.getRepository(BalanceSheet).save(balancesheet);
      this.sortArraysOfBalanceSheet(balanceSheetResponse);
      res.json(balanceSheetResponse);
    }).catch(error => {
      if (error instanceof JsonMappingError) {
        next(new BadRequestException(error.message));
      }
      if (Array.isArray(error) && error.every(item => item instanceof ValidationError)) {
        next(new BadRequestException(error.toString()));
      }
      next(new InternalServerException(error));
    });
  }


  public async updateBalanceSheet(req: Request, res: Response, next: NextFunction) {
    this.connection.manager.transaction(async entityManager => {
      const balanceSheetRepository = entityManager.getRepository(BalanceSheet);
      const entityWithDTOMerger = new EntityWithDTOMerger(entityManager.getRepository(SupplyFraction),
        entityManager.getRepository(EmployeesFraction));
      const balanceSheetId: number = Number(req.params.id);
      const balanceSheet = await balanceSheetRepository.findOneOrFail(balanceSheetId, {
        relations: ['rating', 'companyFacts', 'companyFacts.supplyFractions', 'companyFacts.employeesFractions',
          'rating.topics', 'rating.topics.aspects']
      });
      const balanceSheetDTOUpdate: BalanceSheetDTOUpdate = BalanceSheetDTOUpdate.fromJSON(req.body);
      if (balanceSheetDTOUpdate.id !== balanceSheetId) {
        next(new BadRequestException(`Balance sheet id in request body and url parameter has to be the same`));
      }
      await validateOrReject(balanceSheetDTOUpdate, {
        validationError: { target: false },
      });

      await entityWithDTOMerger.mergeBalanceSheet(balanceSheet, balanceSheetDTOUpdate);
      const precalculations: Precalculations = await new Precalculator(entityManager.getRepository(Region),
        entityManager.getRepository(Industry)).calculate(balanceSheet.companyFacts);
      const maxPointsCalculator: MaxPointsCalculator = new MaxPointsCalculator();
      await maxPointsCalculator.updateMaxPointsAndPoints(balanceSheet.rating.topics, precalculations);
      const balanceSheetResponse: BalanceSheet = await balanceSheetRepository.save(balanceSheet);
      this.sortArraysOfBalanceSheet(balanceSheetResponse);
      res.json(balanceSheetResponse);
    }).catch(error => {
      if (error instanceof JsonMappingError) {
        next(new BadRequestException(error.message));
      }
      if (Array.isArray(error) && error.every(item => item instanceof ValidationError)) {
        next(new BadRequestException(error.toString()));
      }
      next(new InternalServerException(error));
    });
  }

  public async getBalanceSheet(req: Request, res: Response, next: NextFunction) {
    this.connection.manager.transaction(async entityManager => {
      const balanceSheetRepository = entityManager.getRepository(BalanceSheet);
      const balanceSheetId: number = Number(req.params.id);
      const balanceSheet = await balanceSheetRepository.findOneOrFail(balanceSheetId, {
        relations: ['rating', 'companyFacts', 'companyFacts.supplyFractions', 'companyFacts.employeesFractions',
          'rating.topics', 'rating.topics.aspects']
      });
      const balanceSheetResponse: BalanceSheet = await balanceSheetRepository.save(balanceSheet);
      this.sortArraysOfBalanceSheet(balanceSheetResponse);
      res.json(balanceSheetResponse);
    }).catch(error => {
      if (error instanceof JsonMappingError) {
        next(new BadRequestException(error.message));
      }
      next(new InternalServerException(error));
    });
  }

  private sortArraysOfBalanceSheet(balanceSheet: BalanceSheet) {
    balanceSheet.rating.topics.sort((t1, t2) => t1.shortName.localeCompare(t2.shortName));
    balanceSheet.rating.topics.forEach(t =>
      t.aspects.sort((a1, a2) => a1.shortName.localeCompare(a2.shortName))
    );
  }
}
