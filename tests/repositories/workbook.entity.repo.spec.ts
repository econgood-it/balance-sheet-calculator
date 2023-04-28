import axios from 'axios';
import { WorkbookEntityRepo } from '../../src/repositories/workbook.entity.repo';

jest.mock('axios');
const mockedAxios = jest.mocked(axios, true);
describe('WorkbookEntityRepo', () => {
  const apiToken = 'apiToken';

  it('should request workbook from gitea and return it', async () => {
    const workbookRepo = new WorkbookEntityRepo(apiToken);
    const c21Section = {
      shortName: 'C2.1',
      title: 'Renumeration Structure',
    };

    const json = {
      group: {
        label: 'C',
        title: 'Employees',
        value: {
          label: '2',
          title: 'Solidarity & Justice',
          cell: {
            label: 'C2',
            aspect: {
              label: '1',
              title: `${c21Section.title}`,
              questions: [
                'How is work done in the organisation remunerated and how transparent are the underlying conditions?',
                'What possibilities are there in the organisation to determine earnings in a self-organised way?',
              ],
            },
          },
        },
      },
    };
    const content = Buffer.from(JSON.stringify(json)).toString('base64');
    mockedAxios.get.mockResolvedValue({ data: { content } });

    const workbookEntity = await workbookRepo.getWorkbookEntity();
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://git.ecogood.org/api/v1/repos/public/matrix-development/contents/jekyll/workbook.json',
      { headers: { Authorization: `token ${apiToken}` } }
    );

    expect(workbookEntity.findByShortName('C2.1')).toEqual(c21Section);
  });
});
