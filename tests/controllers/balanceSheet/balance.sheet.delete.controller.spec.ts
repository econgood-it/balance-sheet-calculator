import { DatabaseSourceCreator } from '../../../src/databaseSourceCreator';
import App from '../../../src/app';
import { ConfigurationReader } from '../../../src/reader/configuration.reader';

import { DataSource } from 'typeorm';
import { Application } from 'express';

import { Auth, AuthBuilder } from '../../AuthBuilder';
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
  let auth: Auth;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    app = new App(dataSource, configuration, new RepoProvider(configuration))
      .app;
    auth = await new AuthBuilder(app, dataSource).build();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(() => {
    balanceSheetJson = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_8,
      companyFacts: companyFactsJsonFactory.emptyRequest(),
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
      .set(auth.authHeader.key, auth.authHeader.value)
      .send(balanceSheetJson);

    await dataSource.getRepository(BalanceSheetEntity).findOneOrFail({
      where: { id: postResponse.body.id },
      relations: BALANCE_SHEET_RELATIONS,
    });

    const response = await testApp
      .delete(`${endpointPath}/${postResponse.body.id}`)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send();
    expect(response.status).toEqual(200);

    const responseGet = await testApp
      .get(`${endpointPath}/${postResponse.body.id}`)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send();
    expect(responseGet.status).toEqual(404);
  });

  describe('block access to balance sheet ', () => {
    let authOfUnauthorizedUser: Auth;
    beforeAll(async () => {
      authOfUnauthorizedUser = await new AuthBuilder(app, dataSource).build();
    });

    const postAndDeleteWithDifferentUsers = async (): Promise<any> => {
      const testApp = supertest(app);
      const postResponse = await testApp
        .post(endpointPath)
        .set(auth.authHeader.key, auth.authHeader.value)
        .send(balanceSheetJson);

      return await testApp
        .delete(`${endpointPath}/${postResponse.body.id}`)
        .set(
          authOfUnauthorizedUser.authHeader.key,
          authOfUnauthorizedUser.authHeader.value
        )
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
      .set(auth.authHeader.key, auth.authHeader.value)
      .set(CORRELATION_HEADER_NAME, 'my-own-corr-id')
      .send();
    expect(response.status).toEqual(404);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBe('my-own-corr-id');
  });

  it('creates correlation id on delete request', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .delete(`${endpointPath}/9999999`)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send();
    expect(response.status).toEqual(404);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBeDefined();
  });
});
