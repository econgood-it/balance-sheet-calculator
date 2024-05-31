import { Application } from 'express';
import { IBalanceSheetService } from '../services/balance.sheet.service';
import { allowUserOnly } from './role.access';

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
    allowUserOnly,
    balanceSheetService.calculateBalanceSheet
  );
  app.post(
    BalanceSheetPaths.matrixWithoutSave,
    allowUserOnly,
    balanceSheetService.calculateBalanceSheetMatrix
  );
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
