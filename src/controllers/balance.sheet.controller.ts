import { Application } from 'express';
import {
  BalanceSheetService,
  IBalanceSheetService,
} from '../services/balance.sheet.service';
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

export function registerBalanceSheetRoutes(
  app: Application,
  balanceSheetService: IBalanceSheetService
) {
  app.patch(
    BalanceSheetPaths.patch,
    allowUserOnly,
    balanceSheetService.updateBalanceSheet
  );
  app.get(
    BalanceSheetPaths.get,
    allowUserOnly,
    balanceSheetService.getBalanceSheet
  );
  app.delete(
    BalanceSheetPaths.delete,
    allowUserOnly,
    balanceSheetService.deleteBalanceSheet
  );
  app.get(
    BalanceSheetPaths.matrix,
    allowUserOnly,
    balanceSheetService.getMatrixRepresentationOfBalanceSheet
  );
}

export class BalanceSheetController {
  constructor(
    private app: Application,
    public balanceSheetService: BalanceSheetService
  ) {
    this.balanceSheetService = balanceSheetService;
    this.routes();
  }

  public routes() {
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
