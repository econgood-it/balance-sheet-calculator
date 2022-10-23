import { NextFunction, Request, Response } from 'express';

import { handle } from '../exceptions/error.handler';
import { IndustryProvider } from '../providers/industry.provider';
import { IndustryResponseDTO } from '../dto/response/industry.response.dto';
import {
  BalanceSheetVersion,
  BalanceSheetVersionSchema,
} from '../models/balance.sheet';

export class IndustryService {
  public async getIndustries(req: Request, res: Response, next: NextFunction) {
    try {
      const version = BalanceSheetVersionSchema.default(
        BalanceSheetVersion.v5_0_8
      ).parse(req.query?.version);
      const industries = await IndustryProvider.fromVersion(version);
      res.json(
        [...industries.values()].map((i) => IndustryResponseDTO.fromIndustry(i))
      );
    } catch (error) {
      handle(error as Error, next);
    }
  }
}
