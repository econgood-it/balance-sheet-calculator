import { DatabaseSourceCreator } from '../../../src/databaseSourceCreator';
import App from '../../../src/app';
import { ConfigurationReader } from '../../../src/reader/configuration.reader';

import { DataSource } from 'typeorm';
import { Application } from 'express';

import { TokenProvider } from '../../TokenProvider';
import { CORRELATION_HEADER_NAME } from '../../../src/middleware/correlation.id.middleware';
import {
  BALANCE_SHEET_RELATIONS,
  BalanceSheetEntity,
} from '../../../src/entities/balance.sheet.entity';
import { companyFactsJsonFactory } from '../../../src/openapi/examples';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import supertest = require('supertest');
import { RepoProvider } from '../../../src/repositories/repo.provider';

describe('Balance Sheet Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let balanceSheetJson: any;
  const endpointPath = '/v1/balancesheets';
  const tokenHeader = {
    key: 'Authorization',
    value: '',
  };

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    app = new App(dataSource, configuration, new RepoProvider(configuration))
      .app;
    tokenHeader.value = `Bearer ${await TokenProvider.provideValidUserToken(
      app,
      dataSource
    )}`;
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(() => {
    balanceSheetJson = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_4,
      companyFacts: companyFactsJsonFactory.empty(),
    };
  });

  it('deletes balance sheet by id', async () => {
    const testApp = supertest(app);
    balanceSheetJson.companyFacts.industrySectors = [
      {
        industryCode: 'A',
        amountOfTotalTurnover: 0.8,
        description: 'My description',
      },
    ];
    balanceSheetJson.companyFacts.supplyFractions = [
      { countryCode: 'DEU', industryCode: 'A', costs: 300 },
    ];
    balanceSheetJson.companyFacts.employeesFractions = [
      { countryCode: 'DEU', percentage: 0.8 },
    ];
    const postResponse = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .send(balanceSheetJson);

    await dataSource.getRepository(BalanceSheetEntity).findOneOrFail({
      where: { id: postResponse.body.id },
      relations: BALANCE_SHEET_RELATIONS,
    });

    const response = await testApp
      .delete(`${endpointPath}/${postResponse.body.id}`)
      .set(tokenHeader.key, tokenHeader.value)
      .send();
    expect(response.status).toEqual(200);

    const responseGet = await testApp
      .get(`${endpointPath}/${postResponse.body.id}`)
      .set(tokenHeader.key, tokenHeader.value)
      .send();
    expect(responseGet.status).toEqual(404);
  });

  describe('block access to balance sheet ', () => {
    let tokenOfUnauthorizedUser: string;
    beforeAll(async () => {
      tokenOfUnauthorizedUser = `Bearer ${await TokenProvider.provideValidUserToken(
        app,
        dataSource,
        'unauthorizedUser@example.com'
      )}`;
    });

    const postAndDeleteWithDifferentUsers = async (): Promise<any> => {
      const testApp = supertest(app);
      const postResponse = await testApp
        .post(endpointPath)
        .set(tokenHeader.key, tokenHeader.value)
        .send(balanceSheetJson);

      return await testApp
        .delete(`${endpointPath}/${postResponse.body.id}`)
        .set(tokenHeader.key, tokenOfUnauthorizedUser)
        .send();
    };

    it('when delete endpoint is called', async () => {
      const response = await postAndDeleteWithDifferentUsers();
      expect(response.status).toEqual(403);
    });
  });

  it('returns given correlation id on delete request', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .delete(`${endpointPath}/9999999`)
      .set(tokenHeader.key, tokenHeader.value)
      .set(CORRELATION_HEADER_NAME, 'my-own-corr-id')
      .send();
    expect(response.status).toEqual(404);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBe('my-own-corr-id');
  });

  it('creates correlation id on delete request', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .delete(`${endpointPath}/9999999`)
      .set(tokenHeader.key, tokenHeader.value)
      .send();
    expect(response.status).toEqual(404);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBeDefined();
  });
});
