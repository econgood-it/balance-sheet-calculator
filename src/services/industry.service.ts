import { NextFunction, Request, Response } from 'express';

import { handle } from '../exceptions/error.handler';
import { IndustryProvider } from '../providers/industry.provider';
import {
  BalanceSheetVersion,
  BalanceSheetVersionSchema,
} from '../models/balance.sheet';
import { industryToResponse } from '../dto/industry.dto';

export class IndustryService {
  public async getIndustries(req: Request, res: Response, next: NextFunction) {
    try {
      const version = BalanceSheetVersionSchema.default(
        BalanceSheetVersion.v5_0_8
      ).parse(req.query?.version);
      const industries = await IndustryProvider.fromVersion(version);
      res.json([...industries.values()].map((i) => industryToResponse(i)));
    } catch (error) {
      handle(error as Error, next);
    }
  }
}
