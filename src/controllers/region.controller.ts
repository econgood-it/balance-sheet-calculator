import { Application } from 'express';
import { allowAnyone } from '../security/role.access';
import { RegionService } from '../services/region.service';

export class RegionController {
  constructor(private app: Application, public regionService: RegionService) {
    this.routes();
  }

  public routes() {
    this.app.get(
      '/v1/regions',
      allowAnyone,
      this.regionService.getRegions.bind(this.regionService)
    );
  }
}
