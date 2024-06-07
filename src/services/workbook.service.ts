import { NextFunction, Request, Response } from 'express';
import { handle } from '../exceptions/error.handler';
import { IRepoProvider } from '../repositories/repo.provider';
import deepFreeze from 'deep-freeze';
import { parseLanguageParameter } from '../language/translations';

export interface IWorkbookService {
  getWorkbook(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export function makeWorkbookService(
  repoProvider: IRepoProvider
): IWorkbookService {
  async function getWorkbook(req: Request, res: Response, next: NextFunction) {
    try {
      const language = parseLanguageParameter(req.query.lng);
      const workbookRepo = repoProvider.getWorkbookRepo();
      const workbook = await workbookRepo.getWorkbook(language);
      res.json(workbook.toJson());
    } catch (error) {
      handle(error as Error, next);
    }
  }
  return deepFreeze({ getWorkbook });
}
