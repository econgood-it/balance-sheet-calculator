import { Application } from 'express';
import { BalanceSheetService } from '../services/balance.sheet.service';
import { allowUserOnly } from './role.access';

import multer from 'multer';
// setup multer upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  // dest: 'uploads/',
  limits: {
    fileSize: 1000000, // 1MB limit
  },
});

const resourceUrl = '/v1/balancesheets';
export const BalanceSheetPaths = {
  postUpload: `${resourceUrl}/upload`,
  post: `${resourceUrl}`,
  patch: `${resourceUrl}/:id`,
  getAll: `${resourceUrl}`,
  get: `${resourceUrl}/:id`,
  delete: `${resourceUrl}/:id`,
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
    this.app.post(
      BalanceSheetPaths.postUpload,
      allowUserOnly,
      upload.single('balanceSheet'),
      this.balanceSheetService.uploadBalanceSheet.bind(this.balanceSheetService)
    );
    this.app.post(
      '/v1/balancesheets/diff/upload',
      allowUserOnly,
      upload.single('balanceSheet'),
      this.balanceSheetService.diffBetweenUploadApiBalanceSheet.bind(
        this.balanceSheetService
      )
    );
    this.app.get(
      BalanceSheetPaths.getAll,
      allowUserOnly,
      this.balanceSheetService.getBalanceSheetsOfUser.bind(
        this.balanceSheetService
      )
    );
    this.app.get(
      BalanceSheetPaths.get,
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
      BalanceSheetPaths.post,
      allowUserOnly,
      this.balanceSheetService.createBalanceSheet.bind(this.balanceSheetService)
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
  }
}
