import { Application } from 'express';
import { BalanceSheetService } from '../services/balance.sheet.service';


export class BalanceSheetController {

  constructor(private app: Application, public balanceSheetService: BalanceSheetService) {
    this.routes();
  }

  public routes() {
    this.app.get("/v1/balancesheets/:id", this.balanceSheetService.getBalanceSheet.bind(this.balanceSheetService));
    this.app.post("/v1/balancesheets", this.balanceSheetService.createBalanceSheet.bind(this.balanceSheetService));
    this.app.patch("/v1/balancesheets/:id", this.balanceSheetService.updateBalanceSheet.bind(this.balanceSheetService));
  }
}