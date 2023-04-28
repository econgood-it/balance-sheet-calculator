import { z } from 'zod';
import { WorkbookEntity } from '../entities/workbook.entity';
import axios from 'axios';

export interface IWorkbookEntityRepo {
  getWorkbookEntity(): Promise<WorkbookEntity>;
}

const ApiResponseSchema = z.object({
  content: z.string(),
});

const AspectSchema = z.object({
  title: z.string(),
});

export class WorkbookEntityRepo implements IWorkbookEntityRepo {
  constructor(private apiToken: string) {}
  public async getWorkbookEntity(): Promise<WorkbookEntity> {
    const response = await axios.get(
      'https://git.ecogood.org/api/v1/repos/public/matrix-development/contents/jekyll/workbook.json',
      { headers: { Authorization: `token ${this.apiToken}` } }
    );
    const { content } = ApiResponseSchema.parse(response.data);
    const contentAsJson = JSON.parse(Buffer.from(content, 'base64').toString());
    return new WorkbookEntity([
      {
        shortName: 'C2.1',
        title: AspectSchema.parse(contentAsJson.group.value.cell.aspect).title,
      },
    ]);
  }
}

export class InMemoryWorkbookEntityRepo implements IWorkbookEntityRepo {
  constructor(private workbookEntity: WorkbookEntity) {}
  getWorkbookEntity(): Promise<WorkbookEntity> {
    return Promise.resolve(this.workbookEntity);
  }
}
