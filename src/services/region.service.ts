import { NextFunction, Request, Response } from 'express';
import { handle } from '../exceptions/error.handler';
import { RegionProvider } from '../providers/region.provider';
import { BalanceSheetVersionSchema } from '../models/balance.sheet';
import { RegionResponseBodySchema } from 'e-calculator-schemas/dist/region.dto';
import { BalanceSheetVersion } from 'e-calculator-schemas/dist/shared.schemas';

export class RegionService {
  public async getRegions(req: Request, res: Response, next: NextFunction) {
    try {
      const version = BalanceSheetVersionSchema.default(
        BalanceSheetVersion.v5_0_8
      ).parse(req.query?.version);
      const regions = await RegionProvider.fromVersion(version);
      res.json(RegionResponseBodySchema.array().parse([...regions.values()]));
    } catch (error) {
      handle(error as Error, next);
    }
  }
}
