import { Request, Response } from "express";
import { Topic } from "../entities/topic";

export class BalanceSheetService {
  public welcomeMessage(req: Request, res: Response) {
    return res.status(200).send("Welcome to pokeAPI REST by Nya ^^");
  }

  //Adding a new pokemon

  public createBalanceSheet(req: Request, res: Response) {
    const topic = Topic.fromJSON(req.body);
    res.json(topic);
  }
}
