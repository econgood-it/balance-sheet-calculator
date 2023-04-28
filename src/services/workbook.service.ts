import { NextFunction, Request, Response } from 'express';
import { handle } from '../exceptions/error.handler';
import { IRepoProvider } from '../repositories/repo.provider';

export class WorkbookService {
  constructor(private repoProvider: IRepoProvider) {}
  public async getWorkbook(req: Request, res: Response, next: NextFunction) {
    try {
      const workbookRepo = this.repoProvider.getWorkbookEntityRepo();
      const workbookEntity = await workbookRepo.getWorkbookEntity();
      res.json(workbookEntity.toJson());
    } catch (error) {
      handle(error as Error, next);
    }
  }
}
