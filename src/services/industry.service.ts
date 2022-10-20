import { Request, Response, NextFunction } from 'express';

import { Connection } from 'typeorm';
import { Industry } from '../entities/industry';
import { IndustryResponseDTO } from '../dto/response/industry.response.dto';
import { parseLanguageParameter } from '../entities/Translations';
import { handle } from '../exceptions/error.handler';

export class IndustryService {
  constructor(private connection: Connection) {}

  public async getIndustries(req: Request, res: Response, next: NextFunction) {
    const language = parseLanguageParameter(req.query.lng);
    this.connection.manager
      .transaction(async (entityManager) => {
        const industryRepo = entityManager.getRepository(Industry);
        const industries = await industryRepo.find();
        res.json(industries);
        // res.json(
        //   industries.map((i) => IndustryResponseDTO.fromIndustry(i, language))
        // );
      })
      .catch((error) => {
        handle(error, next);
      });
  }
}
