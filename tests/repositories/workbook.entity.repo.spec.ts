import axios from 'axios';
import {
  IWorkbookEntityRepo,
  WorkbookEntityRepo,
} from '../../src/repositories/workbook.entity.repo';
import path from 'path';
import fs from 'fs';
import { workbookEntityFromFile } from '../workbook';
import { WorkbookEntity } from '../../src/entities/workbook.entity';
import { EntityManager } from 'typeorm';
import {
  IOldOrganizationEntityRepo,
  OldOrganizationEntityRepository,
} from '../../src/repositories/oldOrganization.entity.repo';
import {
  BalanceSheetEntityRepository,
  IBalanceSheetEntityRepo,
} from '../../src/repositories/old.balance.sheet.entity.repo';

import { IOldRepoProvider } from '../../src/repositories/oldRepoProvider';

jest.mock('axios');
const mockedAxios = jest.mocked(axios);

export class InMemoryRepoProvider implements IOldRepoProvider {
  constructor(private inMemoryWorkbookEntityRepo: InMemoryWorkbookEntityRepo) {}

  getOrganizationEntityRepo(
    entityManager: EntityManager
  ): IOldOrganizationEntityRepo {
    return new OldOrganizationEntityRepository(entityManager);
  }

  getBalanceSheetEntityRepo(
    entityManager: EntityManager
  ): IBalanceSheetEntityRepo {
    return new BalanceSheetEntityRepository(entityManager);
  }

  getWorkbookEntityRepo(): IWorkbookEntityRepo {
    return this.inMemoryWorkbookEntityRepo;
  }
}

export class InMemoryWorkbookEntityRepo implements IWorkbookEntityRepo {
  private workbookEntity = workbookEntityFromFile();

  getWorkbookEntity(): Promise<WorkbookEntity> {
    return Promise.resolve(this.workbookEntity);
  }
}

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
      'https://git.ecogood.org/api/v1/repos/public/matrix-development/contents/export/workbook-en.json',
      { headers: { Authorization: `token ${apiToken}` } }
    );

    expect(workbookEntity.findByShortName('C2.1')).toEqual({
      shortName: 'C2.1',
      title: 'C2.1 Renumeration Structure',
    });
  });
});
