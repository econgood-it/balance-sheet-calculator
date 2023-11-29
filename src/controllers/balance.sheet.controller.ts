import { Application } from 'express';
import { BalanceSheetService } from '../services/balance.sheet.service';
import { allowUserOnly } from './role.access';
import { upload } from './utils';

const resourceUrl = '/v1/balancesheets';
export const BalanceSheetPaths = {
  post: `${resourceUrl}`,
  patch: `${resourceUrl}/:id`,
  getAll: `${resourceUrl}`,
  get: `${resourceUrl}/:id`,
  delete: `${resourceUrl}/:id`,
  diff: `${resourceUrl}/diff/upload`,
  matrix: `${resourceUrl}/:id/matrix`,
};

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
      BalanceSheetPaths.get,
      allowUserOnly,
      this.balanceSheetService.getBalanceSheet.bind(this.balanceSheetService)
    );
    this.app.get(
      BalanceSheetPaths.matrix,
      allowUserOnly,
      this.balanceSheetService.getMatrixRepresentationOfBalanceSheet.bind(
        this.balanceSheetService
      )
    );
    this.app.patch(
      BalanceSheetPaths.patch,
      allowUserOnly,
      this.balanceSheetService.updateBalanceSheet.bind(this.balanceSheetService)
    );
    this.app.delete(
      BalanceSheetPaths.delete,
      allowUserOnly,
      this.balanceSheetService.deleteBalanceSheet.bind(this.balanceSheetService)
    );
    this.app.post(
      BalanceSheetPaths.diff,
      allowUserOnly,
      upload.single('balanceSheet'),
      this.balanceSheetService.diffBetweenUploadApiBalanceSheet.bind(
        this.balanceSheetService
      )
    );
  }
}
