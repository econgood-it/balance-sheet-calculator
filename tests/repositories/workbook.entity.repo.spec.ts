import axios from 'axios';
import { WorkbookEntityRepo } from '../../src/repositories/workbook.entity.repo';
import path from 'path';
import fs from 'fs';
import { workbookEntityFromFile } from '../workbook';

jest.mock('axios');
const mockedAxios = jest.mocked(axios, true);
describe('WorkbookEntityRepo', () => {
  const apiToken = 'apiToken';

  it('should request workbook from gitea and return it', async () => {
    const workbookRepo = new WorkbookEntityRepo(apiToken);

    const workbookPath = path.join(
      path.resolve(__dirname, '../'),
      'workbook.json'
    );
    const fileText = fs.readFileSync(workbookPath);

    const content = Buffer.from(fileText.toString()).toString('base64');
    mockedAxios.get.mockResolvedValue({ data: { content } });

    const workbookEntity = await workbookRepo.getWorkbookEntity();
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://git.ecogood.org/api/v1/repos/public/matrix-development/contents/jekyll/workbook.json',
      { headers: { Authorization: `token ${apiToken}` } }
    );

    expect(workbookEntity.findByShortName('C2.1')).toEqual({
      shortName: 'C2.1',
      title: 'C2.1 Renumeration Structure',
    });
  });
});
