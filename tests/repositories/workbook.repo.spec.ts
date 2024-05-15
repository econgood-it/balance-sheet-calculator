import axios from 'axios';
import {
  IWorkbookRepo,
  makeWorkbookRepo,
} from '../../src/repositories/workbook.repo';
import path from 'path';
import fs from 'fs';
import { workbookFromFile } from '../workbook';
import { EntityManager } from 'typeorm';
import { IRepoProvider } from '../../src/repositories/repo.provider';
import {
  IOrganizationRepo,
  makeOrganizationRepository,
} from '../../src/repositories/organization.repo';
import deepFreeze from 'deep-freeze';
import {
  IBalanceSheetRepo,
  makeBalanceSheetRepository,
} from '../../src/repositories/balance.sheet.repo';
import { Workbook } from '../../src/models/workbook';

jest.mock('axios');
const mockedAxios = jest.mocked(axios);

export function makeInMemoryWorkbookRepo(): IWorkbookRepo {
  const workbook = workbookFromFile();

  async function getWorkbook(): Promise<Workbook> {
    return Promise.resolve(workbook);
  }
  return deepFreeze({
    getWorkbook,
  });
}

export function makeInMemoryRepoProvider(
  inMemoryWorkbookRepo: IWorkbookRepo
): IRepoProvider {
  function getOrganizationRepo(
    entityManager: EntityManager
  ): IOrganizationRepo {
    return makeOrganizationRepository(entityManager);
  }

  function getBalanceSheetRepo(
    entityManager: EntityManager
  ): IBalanceSheetRepo {
    return makeBalanceSheetRepository(entityManager);
  }

  function getWorkbookRepo(): IWorkbookRepo {
    return inMemoryWorkbookRepo;
  }
  return deepFreeze({
    getOrganizationRepo,
    getBalanceSheetRepo,
    getWorkbookRepo,
  });
}

describe('WorkbookRepo', () => {
  const apiToken = 'apiToken';

  it('should request workbook from gitea and return it', async () => {
    const workbookRepo = makeWorkbookRepo(apiToken);

    const workbookPath = path.join(
      path.resolve(__dirname, '../'),
      'workbook.json'
    );
    const fileText = fs.readFileSync(workbookPath);

    const content = Buffer.from(fileText.toString()).toString('base64');
    mockedAxios.get.mockResolvedValue({ data: { content } });

    const workbook = await workbookRepo.getWorkbook();
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://git.ecogood.org/api/v1/repos/public/matrix-development/contents/export/workbook-en.json',
      { headers: { Authorization: `token ${apiToken}` } }
    );

    expect(workbook.findByShortName('C2.1')).toEqual({
      shortName: 'C2.1',
      title: 'C2.1 Renumeration Structure',
    });
  });
});
