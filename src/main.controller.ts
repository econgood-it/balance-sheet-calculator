import { Application } from 'express';
import { BalanceSheetService } from './services/balanceSheet.service';

export class Controller {
  private balanceSheetService: BalanceSheetService;

  constructor(private app: Application) {
    this.balanceSheetService = new BalanceSheetService();
    this.routes();
  }

  public routes() {
    this.app.route('/').get(this.balanceSheetService.welcomeMessage);
    this.app.route("/balancesheet").post(this.balanceSheetService.createBalanceSheet);
    
  }
}