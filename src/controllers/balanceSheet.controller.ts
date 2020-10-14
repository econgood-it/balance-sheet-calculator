import { Application } from 'express';
import { BalanceSheetService } from '../services/balanceSheet.service';


export class BalanceSheetController {

  constructor(private app: Application, public balanceSheetService: BalanceSheetService) {
    this.balanceSheetService = balanceSheetService;
    this.routes();
  }

  public routes() {
    this.app.route('/').get(this.balanceSheetService.welcomeMessage);
    this.app.route("/balancesheets/:id").get(this.balanceSheetService.getBalanceSheet.bind(this.balanceSheetService));
    this.app.route("/balancesheets").post(this.balanceSheetService.createBalanceSheet.bind(this.balanceSheetService));
    this.app.route("/balancesheets/:id").patch(this.balanceSheetService.updateBalanceSheet.bind(this.balanceSheetService));
  }
}