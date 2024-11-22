import { NextFunction, Request, Response } from 'express';
import { handle } from '../exceptions/error.handler';
import deepFreeze from 'deep-freeze';
import { makeWorkbook } from '../models/workbook';

export interface IWorkbookService {
  getWorkbook(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export function makeWorkbookService(): IWorkbookService {
  async function getWorkbook(req: Request, res: Response, next: NextFunction) {
    try {
      const workbook = makeWorkbook.fromRequest(req);
      res.json(workbook.toJson());
    } catch (error) {
      handle(error as Error, next);
    }
  }
  return deepFreeze({ getWorkbook });
}
