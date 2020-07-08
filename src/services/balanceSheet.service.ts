import { Request, Response } from "express";
import { Rating } from "../entities/rating";
import { LoggingService } from "../logging";


export class BalanceSheetService {
  public welcomeMessage(req: Request, res: Response) {
    return res.status(200).send("The Balance Sheet Calculator API is up and running");
  }

  public createBalanceSheet(req: Request, res: Response) {
    LoggingService.info('Create balancesheet');
    const rating = Rating.fromJSON(req.body);
    res.json(rating);
  }
}
