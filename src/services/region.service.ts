import { Request, Response, NextFunction } from 'express';

import { Connection } from 'typeorm';
import { parseLanguageParameter } from '../entities/Translations';
import { handle } from '../exceptions/error.handler';
import { Region } from '../entities/region';
import {
  BalanceSheetVersion,
  balanceSheetVersionFromJSON,
} from '../entities/enums';
import { RegionProvider } from '../providers/region.provider';
import { RegionResponseDTO } from '../dto/response/region.response.dto';

export class RegionService {
  constructor(private connection: Connection) {}

  public async getRegions(req: Request, res: Response, next: NextFunction) {
    const language = parseLanguageParameter(req.query.lng);
    this.connection.manager
      .transaction(async (entityManager) => {
        const version = req.query.version
          ? balanceSheetVersionFromJSON(req.query.version as string)
          : BalanceSheetVersion.v5_0_6;
        const regionRepo = entityManager.getRepository(Region);
        const validFromVersion =
          await RegionProvider.findCorrectValidFromVersion(version, regionRepo);
        const regions = await regionRepo.find({
          where: { validFromVersion: validFromVersion },
        });
        res.json(regions.map((r) => RegionResponseDTO.fromRegion(r, language)));
      })
      .catch((error) => {
        handle(error, next);
      });
  }
}
