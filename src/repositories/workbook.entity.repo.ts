import { z } from 'zod';
import { WorkbookEntity } from '../entities/workbook.entity';
import axios from 'axios';

export interface IWorkbookEntityRepo {
  getWorkbookEntity(): Promise<WorkbookEntity>;
}

const ApiResponseSchema = z.object({
  content: z.string(),
});

export class WorkbookEntityRepo implements IWorkbookEntityRepo {
  constructor(private apiToken: string) {}
  public async getWorkbookEntity(): Promise<WorkbookEntity> {
    const response = await axios.get(
      'https://git.ecogood.org/api/v1/repos/public/matrix-development/contents/workbook.json',
      { headers: { Authorization: `token ${this.apiToken}` } }
    );
    const { content } = ApiResponseSchema.parse(response.data);
    const contentAsJson = JSON.parse(Buffer.from(content, 'base64').toString());
    return new WorkbookEntity(contentAsJson);
  }
}
