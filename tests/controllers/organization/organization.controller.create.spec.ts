import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { Application } from 'express';
import supertest from 'supertest';
import { DataSource } from 'typeorm';
import App from '../../../src/app';
import { OrganizationPaths } from '../../../src/controllers/organization.controller';
import { DatabaseSourceCreator } from '../../../src/databaseSourceCreator';

import {
  makeJsonFactory,
  makeOrganizationCreateRequest,
} from '../../../src/openapi/examples';
import { ConfigurationReader } from '../../../src/reader/configuration.reader';

import { AuthBuilder } from '../../AuthBuilder';
import { InMemoryAuthentication } from '../in.memory.authentication';
import { v4 as uuid4 } from 'uuid';
import { IOrganizationRepo } from '../../../src/repositories/organization.repo';
import { makeRepoProvider } from '../../../src/repositories/repo.provider';
import { makeOrganization } from '../../../src/models/organization';
import { IBalanceSheetRepo } from '../../../src/repositories/balance.sheet.repo';
import { RatingResponseBodySchema } from '@ecogood/e-calculator-schemas/dist/rating.dto';
import { z } from 'zod';
import { INDUSTRY_CODE_FOR_FINANCIAL_SERVICES } from '../../../src/calculations/finance.calc';
import { generalInformationDummyJson } from '../../models/general.information.dummy';

const assertTopicWeight = (
  shortName: string,
  expectedWeight: number,
  ratings: z.infer<typeof RatingResponseBodySchema>[]
) => {
  const topic = ratings.find(
    (t: z.infer<typeof RatingResponseBodySchema>) => t.shortName === shortName
  );
  expect(topic).toBeDefined();
  expect(topic && topic.weight).toBe(expectedWeight);
};
describe('Organization Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let organizationRepo: IOrganizationRepo;
  const authBuilder = new AuthBuilder();
  const auth = authBuilder.addUser();

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    const repoProvider = makeRepoProvider(configuration);
    organizationRepo = repoProvider.getOrganizationRepo(dataSource.manager);

    app = new App(
      dataSource,
      configuration,
      repoProvider,
      new InMemoryAuthentication(authBuilder.getTokenMap())
    ).app;
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should create organization on post request', async () => {
    const orgaJson = makeOrganizationCreateRequest();
    const testApp = supertest(app);
    const response = await testApp
      .post(OrganizationPaths.post)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send(orgaJson);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(orgaJson);
    const foundOrganization = await organizationRepo.findByIdOrFail(
      response.body.id
    );
    expect(foundOrganization).toMatchObject(orgaJson);
    expect(foundOrganization.members).toHaveLength(1);
    expect(foundOrganization.members[0].id).toBe(auth.user.id);
  });

  it('should fail to create organization if user is unauthenticated', async () => {
    const orgaJson = makeOrganizationCreateRequest();
    const testApp = supertest(app);
    const response = await testApp
      .post(OrganizationPaths.post)
      .set('Authorization', 'Bearer invalid token')
      .send(orgaJson);
    expect(response.status).toBe(401);
  });
});

describe('Organization Balance Sheet Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let balanceSheetRepo: IBalanceSheetRepo;
  let organizationRepo: IOrganizationRepo;
  const authBuilder = new AuthBuilder();
  const auth = authBuilder.addUser();
  const authNoMember = authBuilder.addUser();

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
      new InMemoryAuthentication(authBuilder.getTokenMap())
    ).app;
  });

  afterAll(async () => {
    await dataSource.destroy();
  });
  it('should create balance sheets for organization', async () => {
    const testApp = supertest(app);
    const organization = await organizationRepo.save(
      makeOrganization().invite(auth.user.email).join(auth.user)
    );
    const response = await testApp
      .post(`${OrganizationPaths.getAll}/${organization.id}/balancesheet`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send({
        type: BalanceSheetType.Compact,
        version: BalanceSheetVersion.v5_0_8,
        generalInformation: generalInformationDummyJson,
      });
    expect(response.status).toBe(200);
    const response2 = await testApp
      .post(`${OrganizationPaths.getAll}/${organization.id}/balancesheet`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send({
        type: BalanceSheetType.Full,
        version: BalanceSheetVersion.v5_0_8,
      });
    const foundBalanceSheets = await balanceSheetRepo.findByOrganization(
      organization
    );
    expect(foundBalanceSheets?.map((b) => b.id)).toEqual([
      response.body.id,
      response2.body.id,
    ]);
  });

  it('should create balance sheet of type compact', async () => {
    const testApp = supertest(app);
    const organization = await organizationRepo.save(
      makeOrganization().invite(auth.user.email).join(auth.user)
    );

    const response = await testApp
      .post(`${OrganizationPaths.getAll}/${organization.id}/balancesheet`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send(makeJsonFactory().minimalCompactV506());
    expect(response.status).toEqual(200);
    expect(response.body.type).toEqual(BalanceSheetType.Compact);
  });

  describe('should create balance sheet', () => {
    const balanceSheetJson = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_8,
      companyFacts: makeJsonFactory().emptyCompanyFacts(),
    };

    it('where B1 weight is very high', async () => {
      const testApp = supertest(app);
      const organization = await organizationRepo.save(
        makeOrganization().invite(auth.user.email).join(auth.user)
      );
      const json = {
        ...balanceSheetJson,
        companyFacts: {
          ...balanceSheetJson.companyFacts,
          industrySectors: [
            {
              industryCode: INDUSTRY_CODE_FOR_FINANCIAL_SERVICES,
              amountOfTotalTurnover: 1,
              description: 'desc',
            },
          ],
        },
        generalInformation: { ...generalInformationDummyJson },
      };
      const response = await testApp
        .post(`${OrganizationPaths.getAll}/${organization.id}/balancesheet`)
        .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
        .send(json);
      expect(response.status).toEqual(200);
      assertTopicWeight('B1', 2, response.body.ratings);
    });

    it('where B2 weight is high', async () => {
      const testApp = supertest(app);

      const organization = await organizationRepo.save(
        makeOrganization().invite(auth.user.email).join(auth.user)
      );
      const json = {
        ...balanceSheetJson,
        companyFacts: {
          ...balanceSheetJson.companyFacts,
          profit: 12,
          turnover: 100,
        },
        generalInformation: { ...generalInformationDummyJson },
      };
      const response = await testApp
        .post(`${OrganizationPaths.getAll}/${organization.id}/balancesheet`)
        .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
        .send(json);
      expect(response.status).toEqual(200);
      assertTopicWeight('B2', 1.5, response.body.ratings);
    });
    it('where B4 weight is 0.5', async () => {
      const testApp = supertest(app);
      const organization = await organizationRepo.save(
        makeOrganization().invite(auth.user.email).join(auth.user)
      );
      const json = {
        ...balanceSheetJson,
        companyFacts: {
          ...balanceSheetJson.companyFacts,
          numberOfEmployees: 9,
        },
        generalInformation: { ...generalInformationDummyJson },
      };

      const response = await testApp
        .post(`${OrganizationPaths.getAll}/${organization.id}/balancesheet`)
        .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
        .send(json);
      expect(response.status).toEqual(200);
      assertTopicWeight('B4', 0.5, response.body.ratings);
    });

    it('creates BalanceSheet where B4 weight is 1', async () => {
      const testApp = supertest(app);
      const organization = await organizationRepo.save(
        makeOrganization().invite(auth.user.email).join(auth.user)
      );
      const json = {
        ...balanceSheetJson,
        companyFacts: {
          ...balanceSheetJson.companyFacts,
          numberOfEmployees: 10,
        },
        generalInformation: { ...generalInformationDummyJson },
      };
      const response = await testApp
        .post(`${OrganizationPaths.getAll}/${organization.id}/balancesheet`)
        .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
        .send(json);
      expect(response.status).toEqual(200);
      assertTopicWeight('B4', 1, response.body.ratings);
    });
  });

  it('balance sheet creation should fail if user is not member of organization', async () => {
    const balanceSheet = makeJsonFactory().emptyFullV508();
    const testApp = supertest(app);
    const organization = await organizationRepo.save(
      makeOrganization().invite(auth.user.email).join(auth.user)
    );

    const response = await testApp
      .post(`${OrganizationPaths.getAll}/${organization.id}/balancesheet`)
      .set(authNoMember.toHeaderPair().key, authNoMember.toHeaderPair().value)
      .send(balanceSheet);
    expect(response.status).toEqual(403);
  });
});

describe('Organization Invitation Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let organizationRepo: IOrganizationRepo;
  const authBuilder = new AuthBuilder();
  const auth = authBuilder.addUser();

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    const repoProvider = makeRepoProvider(configuration);
    organizationRepo = repoProvider.getOrganizationRepo(dataSource.manager);
    app = new App(
      dataSource,
      configuration,
      repoProvider,
      new InMemoryAuthentication(authBuilder.getTokenMap())
    ).app;
  });
  //
  afterAll(async () => {
    await dataSource.destroy();
  });
  it('should invite user to organization', async () => {
    const testApp = supertest(app);
    const organization = await organizationRepo.save(
      makeOrganization().withFields({ members: [{ id: auth.user.id }] })
    );
    const email = `${uuid4()}@example.com`;
    const response = await testApp
      .post(
        `${OrganizationPaths.getAll}/${organization.id}/invitation/${email}`
      )
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value);
    expect(response.status).toBe(201);
    const foundOrganization = await organizationRepo.findByIdOrFail(
      organization.id!
    );
    expect(foundOrganization.invitations).toEqual([email]);
  });
});
