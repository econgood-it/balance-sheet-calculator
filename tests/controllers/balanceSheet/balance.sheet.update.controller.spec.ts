import supertest from 'supertest';
import { DataSource } from 'typeorm';
import { DatabaseSourceCreator } from '../../../src/databaseSourceCreator';
import App from '../../../src/app';
import { Application } from 'express';
import { ConfigurationReader } from '../../../src/reader/configuration.reader';

import { Auth, AuthBuilder } from '../../AuthBuilder';
import { CORRELATION_HEADER_NAME } from '../../../src/middleware/correlation.id.middleware';
import { Rating } from '../../../src/models/rating';
import {
  balanceSheetFactory,
  companyFactsJsonFactory,
  organizationFactory,
} from '../../../src/openapi/examples';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { RepoProvider } from '../../../src/repositories/repo.provider';
import { OrganizationEntity } from '../../../src/entities/organization.entity';
import { BalanceSheetEntity } from '../../../src/entities/balance.sheet.entity';

describe('Update endpoint of Balance Sheet Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  const endpointPath = '/v1/balancesheets';
  let auth: Auth;
  let repoProvider: RepoProvider;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    repoProvider = new RepoProvider(configuration);
    app = new App(dataSource, configuration, repoProvider).app;
    auth = await new AuthBuilder(app, dataSource).build();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should update company facts of balance sheet', async () => {
    const testApp = supertest(app);

    let response = await testApp
      .post(endpointPath)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send({
        type: BalanceSheetType.Full,
        version: BalanceSheetVersion.v5_0_8,
        companyFacts: companyFactsJsonFactory.emptyRequest(),
      });
    const balanceSheetUpdate = {
      companyFacts: {
        totalPurchaseFromSuppliers: 30000,
        totalStaffCosts: 1000,
        profit: 3020999,
        financialCosts: 98098,
        incomeFromFinancialInvestments: 7000,
        additionsToFixedAssets: 102999,
        turnover: 30,
        totalAssets: 40,
        numberOfEmployees: 0,
        supplyFractions: [
          { industryCode: 'A', countryCode: 'GBR', costs: 300 },
          { industryCode: 'Ce', countryCode: 'BEL', costs: 300 },
        ],
        employeesFractions: [
          { countryCode: 'GBR', percentage: 20 },
          { countryCode: 'BEL', percentage: 40 },
        ],
        industrySectors: [],
      },
    };
    response = await testApp
      .patch(`${endpointPath}/${response.body.id}`)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send({ ...balanceSheetUpdate });
    expect(response.status).toEqual(200);
    expect(response.body.companyFacts).toMatchObject(
      balanceSheetUpdate.companyFacts
    );
  });

  it('should update balance sheet if user is member of organization', async () => {
    const testApp = supertest(app);
    const orgaRepo = repoProvider.getOrganizationEntityRepo(dataSource.manager);
    const organizationEntity = await orgaRepo.save(
      new OrganizationEntity(undefined, organizationFactory.default(), [
        auth.user,
      ])
    );
    const balanceSheetRepo = repoProvider.getBalanceSheetEntityRepo(
      dataSource.manager
    );
    const savedBalanceSheetEntity = await balanceSheetRepo.save(
      new BalanceSheetEntity(undefined, balanceSheetFactory.emptyFullV508(), [])
    );
    organizationEntity.addBalanceSheetEntity(savedBalanceSheetEntity);
    await orgaRepo.save(organizationEntity);
    const balanceSheetUpdate = {
      companyFacts: {
        totalPurchaseFromSuppliers: 30000,
      },
    };
    const response = await testApp
      .patch(`${endpointPath}/${savedBalanceSheetEntity.id}`)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send({ ...balanceSheetUpdate });
    expect(response.status).toEqual(200);
    expect(response.body.companyFacts).toMatchObject(
      balanceSheetUpdate.companyFacts
    );
  });

  it('should update ratings of balance sheet', async () => {
    const testApp = supertest(app);

    let response = await testApp
      .post(endpointPath)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send({
        type: BalanceSheetType.Full,
        version: BalanceSheetVersion.v5_0_8,
        companyFacts: companyFactsJsonFactory.nonEmptyRequest(),
      });
    const balanceSheetUpdate = {
      ratings: [
        { shortName: 'A1.1', estimations: 2 },
        { shortName: 'A1.2', estimations: -100 },
        { shortName: 'A2.1', estimations: 4 },
        { shortName: 'B1.1', estimations: 0 },
        { shortName: 'B1.2', estimations: 5 },
        { shortName: 'E3.3', estimations: -3 },
      ],
    };
    response = await testApp
      .patch(`${endpointPath}/${response.body.id}`)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send({ ...balanceSheetUpdate });
    expect(response.status).toEqual(200);
    for (const rating of balanceSheetUpdate.ratings) {
      const aspect = findAspect(rating.shortName, response);
      expect(aspect).toMatchObject(rating);
    }
  });

  it('should update rating of full balance sheet', async () => {
    await testEstimationsUpdate(
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_8
    );
  });

  it('should update rating of compact balance sheet', async () => {
    await testEstimationsUpdate(
      BalanceSheetType.Compact,
      BalanceSheetVersion.v5_0_6
    );
  });

  async function testEstimationsUpdate(
    balanceSheetType: BalanceSheetType,
    balanceSheetVersion: BalanceSheetVersion
  ): Promise<void> {
    const testApp = supertest(app);

    let response = await testApp
      .post(endpointPath)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send({
        type: balanceSheetType,
        version: balanceSheetVersion,
        companyFacts: companyFactsJsonFactory.nonEmptyRequest(),
      });
    const balanceSheetUpdate = {
      ratings: [
        {
          shortName: 'A1',
        },
        {
          shortName: 'A1.1',
          estimations: 6,
        },
        {
          shortName: 'A1.2',
          estimations: -200,
        },
      ],
    };
    response = await testApp
      .patch(`${endpointPath}/${response.body.id}`)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send({ ...balanceSheetUpdate });

    expect(response.status).toEqual(200);
    const aspectA11 = findAspect('A1.1', response);
    expect(aspectA11).toMatchObject({
      shortName: 'A1.1',
      estimations: 6,
    });
    const aspectA12 = findAspect('A1.2', response);
    expect(aspectA12).toMatchObject({
      shortName: 'A1.2',
      estimations: -200,
    });
  }

  function findAspect(shortName: string, response: any): Rating | undefined {
    return response.body.ratings.find(
      (r: { shortName: string }) => r.shortName === shortName
    );
  }

  describe('block access to balance sheet ', () => {
    let authOfUnauthorizedUser: Auth;
    beforeAll(async () => {
      authOfUnauthorizedUser = await new AuthBuilder(app, dataSource).build();
    });

    const postAndPatchWithDifferentUsers = async (): Promise<any> => {
      const testApp = supertest(app);
      const postResponse = await testApp
        .post(endpointPath)
        .set(auth.authHeader.key, auth.authHeader.value)
        .send({
          type: BalanceSheetType.Full,
          version: BalanceSheetVersion.v5_0_8,
          companyFacts: companyFactsJsonFactory.nonEmptyRequest(),
        });
      const balanceSheetUpdate = {
        id: postResponse.body.id,
        companyFacts: {
          totalPurchaseFromSuppliers: 30000,
        },
      };

      return await testApp
        .patch(`${endpointPath}/${postResponse.body.id}`)
        .set(
          authOfUnauthorizedUser.authHeader.key,
          authOfUnauthorizedUser.authHeader.value
        )
        .send({ ...balanceSheetUpdate });
    };

    it('when patch endpoint is called', async () => {
      const response = await postAndPatchWithDifferentUsers();
      expect(response.status).toEqual(403);
    });
  });

  it('returns given correlation id on update request', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .put(`${endpointPath}/9999999`)
      .set(auth.authHeader.key, auth.authHeader.value)
      .set(CORRELATION_HEADER_NAME, 'my-own-corr-id')
      .send();
    expect(response.status).toEqual(404);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBe('my-own-corr-id');
  });

  it('creates correlation id on put request', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .put(`${endpointPath}/9999999`)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send();
    expect(response.status).toEqual(404);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBeDefined();
  });
});
