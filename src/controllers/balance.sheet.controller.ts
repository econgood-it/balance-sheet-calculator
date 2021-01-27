import { Application } from 'express';
import { BalanceSheetService } from '../services/balance.sheet.service';


export class BalanceSheetController {

  constructor(private app: Application, public balanceSheetService: BalanceSheetService) {
    this.routes();
  }

  public routes() {
    this.app.get("/", this.balanceSheetService.welcomeMessage);
    this.app.get("/balancesheets/:id", this.balanceSheetService.getBalanceSheet.bind(this.balanceSheetService));
    this.app.post("/balancesheets", this.balanceSheetService.createBalanceSheet.bind(this.balanceSheetService));
    this.app.patch("/balancesheets/:id", this.balanceSheetService.updateBalanceSheet.bind(this.balanceSheetService));
  }
}