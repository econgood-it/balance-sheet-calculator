import { Application } from 'express';
import { BalanceSheetService } from './services/balanceSheet.service';
import { RegionService } from './services/region.service';

export class Controller {
  private balanceSheetService: BalanceSheetService;
  private regionService: RegionService;

  constructor(private app: Application) {
    this.balanceSheetService = new BalanceSheetService();
    this.regionService = new RegionService();
    this.routes();
  }

  public routes() {
    this.app.route('/').get(this.balanceSheetService.welcomeMessage);
    this.app.route("/balancesheet").post(this.balanceSheetService.createBalanceSheet);
    this.app.route("/region").post(this.regionService.createRegion);

  }
}