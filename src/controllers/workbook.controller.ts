import { Application } from 'express';
import { allowAnyone } from '../security/role.access';
import { IWorkbookService } from '../services/workbook.service';

export const WorkbookPaths = {
  get: '/v1/workbook',
};

export function registerWorkbookRoutes(
  app: Application,
  workbookService: IWorkbookService
) {
  app.get(WorkbookPaths.get, allowAnyone, workbookService.getWorkbook);
}
