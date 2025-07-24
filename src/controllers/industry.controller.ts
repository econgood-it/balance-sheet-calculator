import { Application } from 'express';
import { allowAnyone } from '../security/role.access';
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
      allowAnyone,
      this.industryService.getIndustries.bind(this.industryService)
    );
  }
}
