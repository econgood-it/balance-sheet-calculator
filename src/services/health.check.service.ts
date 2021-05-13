import { Request, Response } from 'express';

export class HealthCheckService {
  public welcomeMessage(req: Request, res: Response) {
    return res
      .status(200)
      .send('The Balance Sheet Calculator API is up and running');
  }
}
