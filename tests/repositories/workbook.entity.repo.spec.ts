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
  IOrganizationEntityRepo,
  OrganizationEntityRepository,
} from '../../src/repositories/organization.entity.repo';
import {
  IUserEntityRepo,
  UserEntityRepository,
} from '../../src/repositories/user.entity.repo';
import {
  BalanceSheetEntityRepository,
  IBalanceSheetEntityRepo,
} from '../../src/repositories/balance.sheet.entity.repo';
import {
  ApiKeyRepository,
  IApiKeyRepo,
} from '../../src/repositories/api.key.entity.repo';
import { IRepoProvider } from '../../src/repositories/repo.provider';

jest.mock('axios');
const mockedAxios = jest.mocked(axios, true);

export class InMemoryRepoProvider implements IRepoProvider {
  constructor(private inMemoryWorkbookEntityRepo: InMemoryWorkbookEntityRepo) {}

  getOrganizationEntityRepo(
    entityManager: EntityManager
  ): IOrganizationEntityRepo {
    return new OrganizationEntityRepository(entityManager);
  }

  getUserEntityRepo(entityManager: EntityManager): IUserEntityRepo {
    return new UserEntityRepository(entityManager);
  }

  getBalanceSheetEntityRepo(
    entityManager: EntityManager
  ): IBalanceSheetEntityRepo {
    return new BalanceSheetEntityRepository(entityManager);
  }

  getApiKeyRepo(entityManager: EntityManager): IApiKeyRepo {
    return new ApiKeyRepository(entityManager);
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
