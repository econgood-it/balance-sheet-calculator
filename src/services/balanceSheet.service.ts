import { Request, Response, NextFunction } from "express";
import { LoggingService } from "../logging";
import { BalanceSheetDTOCreate } from "../dto/create/balanceSheetCreate.dto";
import { BalanceSheet } from "../entities/balanceSheet";
import InternalServerException from "../exceptions/InternalServerException";
import { Repository } from "typeorm";
import { BalanceSheetDTOUpdate } from "../dto/update/balanceSheetUpdate.dto";
import { MaxPointsCalculator } from "../calculations/MaxPointsCalculator";
import RegionService from "./region.service";
import { CompanyFacts } from "../entities/companyFacts";
import { SupplyFraction } from "../entities/supplyFraction";
import { EmployeesFraction } from "../entities/employeesFraction";
import { EntityWithDTOMerger } from "../entities/entityWithDTOMerger";


export class BalanceSheetService {

  private readonly entityWithDTOMerger: EntityWithDTOMerger;

  constructor(private balanceSheetRepository: Repository<BalanceSheet>, private regionService: RegionService,
    supplyFractionRepository: Repository<SupplyFraction>, employeesFractionRepository: Repository<EmployeesFraction>) {
    this.entityWithDTOMerger = new EntityWithDTOMerger(supplyFractionRepository, employeesFractionRepository);
  }

  public welcomeMessage(req: Request, res: Response) {
    return res.status(200).send("The Balance Sheet Calculator API is up and running");
  }

  public async createBalanceSheet(req: Request, res: Response, next: NextFunction) {
    LoggingService.info('Create balancesheet');
    try {
      const balancesheet: BalanceSheet = BalanceSheetDTOCreate.fromJSON(req.body).toBalanceSheet();
      const maxPointsCalculator: MaxPointsCalculator = new MaxPointsCalculator(balancesheet.companyFacts, this.regionService);
      await maxPointsCalculator.updateMaxPointsOfTopics(balancesheet.rating.topics);
      const balanceSheetResponse: BalanceSheet = await this.balanceSheetRepository.save(balancesheet);
      res.json(balanceSheetResponse);
    } catch (error) {
      next(new InternalServerException(error));
    }
  }

  public async updateBalanceSheet(req: Request, res: Response, next: NextFunction) {
    LoggingService.info('Create balancesheet');
    try {
      const balanceSheetDTOUpdate: BalanceSheetDTOUpdate = BalanceSheetDTOUpdate.fromJSON(req.body);
      const balanceSheet = await this.balanceSheetRepository.findOneOrFail(balanceSheetDTOUpdate.id, {
        relations: ['rating', 'companyFacts', 'companyFacts.supplyFractions', 'companyFacts.employeesFractions', 'rating.topics']
      });
      await this.entityWithDTOMerger.mergeBalanceSheet(balanceSheet, balanceSheetDTOUpdate);
      const maxPointsCalculator: MaxPointsCalculator = new MaxPointsCalculator(balanceSheet.companyFacts, this.regionService);
      await maxPointsCalculator.updateMaxPointsOfTopics(balanceSheet.rating.topics);
      const balanceSheetResponse: BalanceSheet = await this.balanceSheetRepository.save(balanceSheet);
      res.json(balanceSheetResponse);
    } catch (error) {
      next(new InternalServerException(error));
    }
  }
}
