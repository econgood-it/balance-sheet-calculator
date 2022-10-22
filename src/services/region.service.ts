import { NextFunction, Request, Response } from 'express';
import { handle } from '../exceptions/error.handler';
import { RegionProvider } from '../providers/region.provider';
import { RegionResponseDTO } from '../dto/response/region.response.dto';
import {
  BalanceSheetVersion,
  balanceSheetVersionFromJSON,
} from '../models/balance.sheet';

export class RegionService {
  public async getRegions(req: Request, res: Response, next: NextFunction) {
    try {
      const version = req.query.version
        ? balanceSheetVersionFromJSON(req.query.version as string)
        : BalanceSheetVersion.v5_0_8;
      const regions = await RegionProvider.fromVersion(version);
      res.json(
        [...regions.values()].map((r) => RegionResponseDTO.fromRegion(r))
      );
    } catch (error) {
      handle(error as Error, next);
    }
  }
}
