import supertest from 'supertest';
import { DataSource } from 'typeorm';
import { DatabaseSourceCreator } from '../../../src/databaseSourceCreator';
import App from '../../../src/app';
import { Application } from 'express';
import { ConfigurationReader } from '../../../src/reader/configuration.reader';

import { AuthBuilder } from '../../AuthBuilder';
import { CORRELATION_HEADER_NAME } from '../../../src/middleware/correlation.id.middleware';
import { OldRating } from '../../../src/models/oldRating';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { OldRepoProvider } from '../../../src/repositories/oldRepoProvider';
import { OrganizationBuilder } from '../../OrganizationBuilder';
import { InMemoryAuthentication } from '../in.memory.authentication';
import { makeRepoProvider } from '../../../src/repositories/repo.provider';
import { makeOrganization } from '../../../src/models/organization';
import { makeBalanceSheet } from '../../../src/models/balance.sheet';
import { IOrganizationRepo } from '../../../src/repositories/organization.repo';
import { IBalanceSheetRepo } from '../../../src/repositories/balance.sheet.repo';

describe('Update endpoint of Balance Sheet Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  const endpointPath = '/v1/balancesheets';
  let organizationRepo: IOrganizationRepo;
  let balanceSheetRepo: IBalanceSheetRepo;

  const authBuilder = new AuthBuilder();
  const auth = authBuilder.addUser();
  const authWithoutOrgaPermissions = authBuilder.addUser();
  const organizationBuilder = new OrganizationBuilder().addMember(auth.user);

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    const repoProvider = makeRepoProvider(configuration);
    organizationRepo = repoProvider.getOrganizationRepo(dataSource.manager);
    balanceSheetRepo = repoProvider.getBalanceSheetRepo(dataSource.manager);
    app = new App(
      dataSource,
      configuration,
      repoProvider,
      new OldRepoProvider(configuration),
      new InMemoryAuthentication(authBuilder.getTokenMap())
    ).app;
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should update company facts of balance sheet', async () => {
    const testApp = supertest(app);
    const organization = await organizationRepo.save(
      makeOrganization().invite(auth.user.email).join(auth.user)
    );
    const balanceSheet = await balanceSheetRepo.save(
      makeBalanceSheet().assignOrganization(organization)
    );

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
    const response = await testApp
      .patch(`${endpointPath}/${balanceSheet.id}`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send({ ...balanceSheetUpdate });
    expect(response.status).toEqual(200);
    expect(response.body.companyFacts).toMatchObject(
      balanceSheetUpdate.companyFacts
    );
  });

  it('should update ratings of balance sheet', async () => {
    const testApp = supertest(app);
    const organization = await organizationRepo.save(
      makeOrganization().invite(auth.user.email).join(auth.user)
    );
    const balanceSheet = await balanceSheetRepo.save(
      makeBalanceSheet().assignOrganization(organization)
    );
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
    const response = await testApp
      .patch(`${endpointPath}/${balanceSheet.id}`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
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

    const organization = await organizationRepo.save(
      makeOrganization().invite(auth.user.email).join(auth.user)
    );
    const balanceSheet = await balanceSheetRepo.save(
      makeBalanceSheet({
        ...makeBalanceSheet(),
        type: balanceSheetType,
        version: balanceSheetVersion,
      }).assignOrganization(organization)
    );

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
    const response = await testApp
      .patch(`${endpointPath}/${balanceSheet.id}`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
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

  function findAspect(shortName: string, response: any): OldRating | undefined {
    return response.body.ratings.find(
      (r: { shortName: string }) => r.shortName === shortName
    );
  }

  describe('block access to balance sheet ', () => {
    const patchWithDifferentUsers = async (): Promise<any> => {
      const testApp = supertest(app);

      const organization = await organizationRepo.save(
        makeOrganization().invite(auth.user.email).join(auth.user)
      );
      const balanceSheet = await balanceSheetRepo.save(
        makeBalanceSheet().assignOrganization(organization)
      );

      const balanceSheetUpdate = {
        companyFacts: {
          totalPurchaseFromSuppliers: 30000,
        },
      };

      return testApp
        .patch(`${endpointPath}/${balanceSheet.id}`)
        .set(
          authWithoutOrgaPermissions.toHeaderPair().key,
          authWithoutOrgaPermissions.toHeaderPair().value
        )
        .send({ ...balanceSheetUpdate });
    };

    it('when patch endpoint is called', async () => {
      const response = await patchWithDifferentUsers();
      expect(response.status).toEqual(403);
    });
  });

  it('returns given correlation id on update request', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .put(`${endpointPath}/9999999`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .set(CORRELATION_HEADER_NAME, 'my-own-corr-id')
      .send();
    expect(response.status).toEqual(404);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBe('my-own-corr-id');
  });

  it('creates correlation id on put request', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .put(`${endpointPath}/9999999`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send();
    expect(response.status).toEqual(404);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBeDefined();
  });
});
