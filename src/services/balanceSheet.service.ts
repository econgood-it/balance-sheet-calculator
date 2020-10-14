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


export class BalanceSheetService {


  constructor(private connection: Connection) {
  }

  public welcomeMessage(req: Request, res: Response) {
    return res.status(200).send("The Balance Sheet Calculator API is up and running");
  }

  public async createBalanceSheet(req: Request, res: Response, next: NextFunction) {
    LoggingService.info('Create balancesheet');
    this.connection.manager.transaction(async entityManager => {
      const balancesheet: BalanceSheet = (await BalanceSheetDTOCreate.fromJSON(req.body)).toBalanceSheet();
      const maxPointsCalculator: MaxPointsCalculator = new MaxPointsCalculator(balancesheet.companyFacts,
        entityManager.getRepository(Region));
      await maxPointsCalculator.updateMaxPointsAndPoints(balancesheet.rating.topics);
      const balanceSheetResponse: BalanceSheet = await entityManager.getRepository(BalanceSheet).save(balancesheet);
      this.sortArraysOfBalanceSheet(balanceSheetResponse);
      res.json(balanceSheetResponse);
    }).catch(error => {
      if (error instanceof JsonMappingError) {
        next(new BadRequestException(error.message));
      }
      next(new InternalServerException(error));
    });
  }


  public async updateBalanceSheet(req: Request, res: Response, next: NextFunction) {
    LoggingService.info('Update balancesheet');
    this.connection.manager.transaction(async entityManager => {
      const balanceSheetRepository = entityManager.getRepository(BalanceSheet);
      const entityWithDTOMerger = new EntityWithDTOMerger(entityManager.getRepository(SupplyFraction),
        entityManager.getRepository(EmployeesFraction));
      const balanceSheetId: number = Number(req.params.id);
      const balanceSheet = await balanceSheetRepository.findOneOrFail(balanceSheetId, {
        relations: ['rating', 'companyFacts', 'companyFacts.supplyFractions', 'companyFacts.employeesFractions',
          'rating.topics', 'rating.topics.aspects']
      });
      let balanceSheetDTOUpdate: BalanceSheetDTOUpdate;
      if (balanceSheet.type === BalanceSheetType.Compact) {
        balanceSheetDTOUpdate = BalanceSheetDTOUpdate.fromJSONCompact(req.body);
      } else {
        balanceSheetDTOUpdate = BalanceSheetDTOUpdate.fromJSONFull(req.body);
      }
      if (balanceSheetDTOUpdate.id !== balanceSheetId) {
        next(new BadRequestException(`Balance sheet id in request body and url parameter has to be the same`));
      }

      await entityWithDTOMerger.mergeBalanceSheet(balanceSheet, balanceSheetDTOUpdate);
      const maxPointsCalculator: MaxPointsCalculator = new MaxPointsCalculator(balanceSheet.companyFacts,
        entityManager.getRepository(Region));
      await maxPointsCalculator.updateMaxPointsAndPoints(balanceSheet.rating.topics);
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
