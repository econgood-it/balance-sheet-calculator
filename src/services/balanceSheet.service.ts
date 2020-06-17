import { Request, Response } from "express";
import { Rating } from "../entities/rating";

export class BalanceSheetService {
  public welcomeMessage(req: Request, res: Response) {
    return res.status(200).send("Welcome to pokeAPI REST by Nya ^^");
  }

  //Adding a new pokemon

  public createBalanceSheet(req: Request, res: Response) {
    const rating = Rating.fromJSON(req.body);
    res.json(rating);
  }
}
