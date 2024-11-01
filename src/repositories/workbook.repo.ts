import { z } from 'zod';
import axios from 'axios';
import deepFreeze from 'deep-freeze';
import { makeWorkbookOld, WorkbookOld } from '../models/workbookOld';
import { Translations } from '../language/translations';

export interface IWorkbookRepo {
  getWorkbook(lng: keyof Translations): Promise<WorkbookOld>;
}

const ApiResponseSchema = z.object({
  content: z.string(),
});

export function makeWorkbookRepo(apiToken: string): IWorkbookRepo {
  async function getWorkbook(lng: keyof Translations): Promise<WorkbookOld> {
    const response = await axios.get(
      `https://git.ecogood.org/api/v1/repos/public/matrix-development/contents/export/workbook-${lng}.json`,
      { headers: { Authorization: `token ${apiToken}` } }
    );
    const { content } = ApiResponseSchema.parse(response.data);
    const contentAsJson = JSON.parse(Buffer.from(content, 'base64').toString());
    return makeWorkbookOld.fromJson(contentAsJson);
  }
  return deepFreeze({ getWorkbook });
}
