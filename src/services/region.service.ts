import { NextFunction, Request, Response } from 'express';
import { handle } from '../exceptions/error.handler';
import { RegionProvider } from '../providers/region.provider';
import { RegionResponseDTO } from '../dto/response/region.response.dto';
import {
  BalanceSheetVersion,
  BalanceSheetVersionSchema,
} from '../models/balance.sheet';

export class RegionService {
  public async getRegions(req: Request, res: Response, next: NextFunction) {
    try {
      const version = BalanceSheetVersionSchema.default(
        BalanceSheetVersion.v5_0_8
      ).parse(req.query?.version);
      const regions = await RegionProvider.fromVersion(version);
      res.json(
        [...regions.values()].map((r) => RegionResponseDTO.fromRegion(r))
      );
    } catch (error) {
      handle(error as Error, next);
    }
  }
}
