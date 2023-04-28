import { Application } from 'express';
import { allowUserOnly } from './role.access';
import { WorkbookService } from '../services/workbook.service';

export class WorkbookController {
  constructor(
    private app: Application,
    public workbookService: WorkbookService
  ) {
    this.routes();
  }

  public routes() {
    this.app.get(
      '/v1/workbook',
      allowUserOnly,
      this.workbookService.getWorkbook.bind(this.workbookService)
    );
  }
}
