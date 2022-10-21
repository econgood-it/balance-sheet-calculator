import { NextFunction, Request, Response } from 'express';

import { handle } from '../exceptions/error.handler';
import {
  BalanceSheetVersion,
  balanceSheetVersionFromJSON,
} from '../entities/enums';
import { IndustryProvider } from '../providers/industry.provider';

export class IndustryService {
  public async getIndustries(req: Request, res: Response, next: NextFunction) {
    try {
      const version = req.query.version
        ? balanceSheetVersionFromJSON(req.query.version as string)
        : BalanceSheetVersion.v5_0_8;
      const industries = await IndustryProvider.fromVersion(version);
      res.json([...industries.values()]);
    } catch (error) {
      handle(error as Error, next);
    }
  }
}
