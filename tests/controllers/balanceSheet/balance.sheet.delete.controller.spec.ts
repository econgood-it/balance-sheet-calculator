import App from '../../../src/app';
import { DatabaseSourceCreator } from '../../../src/databaseSourceCreator';
import { ConfigurationReader } from '../../../src/reader/configuration.reader';

import { Application } from 'express';
import { DataSource } from 'typeorm';

import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import supertest from 'supertest';
import {
  BALANCE_SHEET_RELATIONS,
  BalanceSheetEntity,
} from '../../../src/entities/balance.sheet.entity';
import { CORRELATION_HEADER_NAME } from '../../../src/middleware/correlation.id.middleware';
import { companyFactsJsonFactory } from '../../../src/openapi/examples';
import { OldRepoProvider } from '../../../src/repositories/oldRepoProvider';
import { AuthBuilder } from '../../AuthBuilder';
import { OrganizationBuilder } from '../../OrganizationBuilder';
import { InMemoryAuthentication } from '../in.memory.authentication';

describe('Balance Sheet Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let balanceSheetJson: any;
  const endpointPath = '/v1/balancesheets';
  const authBuilder = new AuthBuilder();
  const auth = authBuilder.addUser();
  const authWithoutOrgaPermissions = authBuilder.addUser();
  const organizationBuilder = new OrganizationBuilder().addMember(auth.user);

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    app = new App(
      dataSource,
      configuration,
      new OldRepoProvider(configuration),
      new InMemoryAuthentication(authBuilder.getTokenMap())
    ).app;
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  const createBalanceSheet = async () => {
    const [balanceSheetEntity] = (
      await organizationBuilder.addBalanceSheetEntity().build(dataSource)
    ).organizationEntity.balanceSheetEntities!;
    return balanceSheetEntity;
  };

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
    const createdBalanceSheet = await createBalanceSheet();

    await dataSource.getRepository(BalanceSheetEntity).findOneOrFail({
      where: { id: createdBalanceSheet.id },
      relations: BALANCE_SHEET_RELATIONS,
    });

    const response = await testApp
      .delete(`${endpointPath}/${createdBalanceSheet.id}`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send();
    expect(response.status).toEqual(200);

    const responseGet = await testApp
      .get(`${endpointPath}/${createdBalanceSheet.id}`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send();
    expect(responseGet.status).toEqual(404);
  });

  describe('block access to balance sheet ', () => {
    const postAndDeleteWithDifferentUsers = async (): Promise<any> => {
      const testApp = supertest(app);
      const createdBalanceSheet = await createBalanceSheet();

      return testApp
        .delete(`${endpointPath}/${createdBalanceSheet.id}`)
        .set(
          authWithoutOrgaPermissions.toHeaderPair().key,
          authWithoutOrgaPermissions.toHeaderPair().value
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
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .set(CORRELATION_HEADER_NAME, 'my-own-corr-id')
      .send();
    expect(response.status).toEqual(404);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBe('my-own-corr-id');
  });

  it('creates correlation id on delete request', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .delete(`${endpointPath}/9999999`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send();
    expect(response.status).toEqual(404);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBeDefined();
  });
});
