import { Application } from 'express';
import { IBalanceSheetService } from '../services/balance.sheet.service';
import { allowAnyone } from '../security/role.access';

const resourceUrl = '/v1/balancesheets';
export const BalanceSheetPaths = {
  post: `${resourceUrl}`,
  patch: `${resourceUrl}/:id`,
  getAll: `${resourceUrl}`,
  get: `${resourceUrl}/:id`,
  delete: `${resourceUrl}/:id`,
  diff: `${resourceUrl}/diff/upload`,
  matrix: `${resourceUrl}/:id/matrix`,
  matrixWithoutSave: `${resourceUrl}/matrix`,
};

export function registerBalanceSheetRoutes(
  app: Application,
  balanceSheetService: IBalanceSheetService
) {
  app.post(
    BalanceSheetPaths.post,
    allowAnyone,
    balanceSheetService.calculateBalanceSheet
  );
  app.post(
    BalanceSheetPaths.matrixWithoutSave,
    allowAnyone,
    balanceSheetService.calculateBalanceSheetMatrix
  );
  app.patch(
    BalanceSheetPaths.patch,
    allowAnyone,
    balanceSheetService.updateBalanceSheet
  );
  app.get(
    BalanceSheetPaths.get,
    allowAnyone,
    balanceSheetService.getBalanceSheet
  );
  app.delete(
    BalanceSheetPaths.delete,
    allowAnyone,
    balanceSheetService.deleteBalanceSheet
  );
  app.get(
    BalanceSheetPaths.matrix,
    allowAnyone,
    balanceSheetService.getMatrixRepresentationOfBalanceSheet
  );
}
