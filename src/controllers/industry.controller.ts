import { Application } from 'express';
import { allowUserOnly } from './role.access';
import { IndustryService } from '../services/industry.service';

export class IndustryController {
  constructor(
    private app: Application,
    public industryService: IndustryService
  ) {
    this.routes();
  }

  public routes() {
    this.app.get(
      '/v1/industries',
      allowUserOnly,
      this.industryService.getIndustries.bind(this.industryService)
    );
  }
}
