import { Application } from 'express';
import { BalanceSheetService } from '../services/balance.sheet.service';
import { allowUserOnly } from './role.access';

export class BalanceSheetController {
  constructor(
    private app: Application,
    public balanceSheetService: BalanceSheetService
  ) {
    this.balanceSheetService = balanceSheetService;
    this.routes();
  }

  public routes() {
    this.app.get(
      '/v1/balancesheets',
      allowUserOnly,
      this.balanceSheetService.getBalanceSheetsOfUser.bind(
        this.balanceSheetService
      )
    );
    this.app.get(
      '/v1/balancesheets/:id',
      allowUserOnly,
      this.balanceSheetService.getBalanceSheet.bind(this.balanceSheetService)
    );
    this.app.get(
      '/v1/balancesheets/:id/matrix',
      allowUserOnly,
      this.balanceSheetService.getMatrixRepresentationOfBalanceSheet.bind(
        this.balanceSheetService
      )
    );
    this.app.post(
      '/v1/balancesheets',
      allowUserOnly,
      this.balanceSheetService.createBalanceSheet.bind(this.balanceSheetService)
    );
    this.app.patch(
      '/v1/balancesheets/:id',
      allowUserOnly,
      this.balanceSheetService.updateBalanceSheet.bind(this.balanceSheetService)
    );
    this.app.delete(
      '/v1/balancesheets/:id',
      allowUserOnly,
      this.balanceSheetService.deleteBalanceSheet.bind(this.balanceSheetService)
    );
  }
}
