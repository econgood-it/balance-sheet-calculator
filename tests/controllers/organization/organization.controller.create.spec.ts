import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { Application } from 'express';
import path from 'path';
import supertest from 'supertest';
import { DataSource } from 'typeorm';
import App from '../../../src/app';
import { OrganizationPaths } from '../../../src/controllers/organization.controller';
import { DatabaseSourceCreator } from '../../../src/databaseSourceCreator';
import { BalanceSheetEntity } from '../../../src/entities/balance.sheet.entity';
import { RatingsFactory } from '../../../src/factories/ratings.factory';
import { INDUSTRY_CODE_FOR_FINANCIAL_SERVICES } from '../../../src/models/company.facts';
import { Rating, RatingResponseBody } from '../../../src/models/rating';
import {
  balanceSheetFactory,
  balanceSheetJsonFactory,
  companyFactsFactory,
  companyFactsJsonFactory,
  organizationFactory,
} from '../../../src/openapi/examples';
import { ConfigurationReader } from '../../../src/reader/configuration.reader';
import { IBalanceSheetEntityRepo } from '../../../src/repositories/balance.sheet.entity.repo';
import { IOrganizationEntityRepo } from '../../../src/repositories/organization.entity.repo';
import { RepoProvider } from '../../../src/repositories/repo.provider';
import { AuthBuilder } from '../../AuthBuilder';
import { OrganizationBuilder } from '../../OrganizationBuilder';
import { InMemoryAuthentication } from '../in.memory.authentication';

const assertTopicWeight = (
  shortName: string,
  expectedWeight: number,
  ratings: RatingResponseBody[]
) => {
  const topic = ratings.find(
    (t: RatingResponseBody) => t.shortName === shortName
  );
  expect(topic).toBeDefined();
  expect(topic && topic.weight).toBe(expectedWeight);
};
describe('Organization Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let organizationRepo: IOrganizationEntityRepo;
  const authBuilder = new AuthBuilder();
  const auth = authBuilder.addUser();

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    const repoProvider = new RepoProvider(configuration);
    organizationRepo = repoProvider.getOrganizationEntityRepo(
      dataSource.manager
    );
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
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const response = await testApp
      .post(OrganizationPaths.post)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send(orgaJson);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(orgaJson);
    const organizationEntity = await organizationRepo.findByIdOrFail(
      response.body.id
    );
    expect(organizationEntity.organization).toMatchObject(orgaJson);
    expect(organizationEntity.members).toHaveLength(1);
    expect(organizationEntity.members[0].id).toBe(auth.user.email);
  });

  it('should fail to create organization if user is unauthenticated', async () => {
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const response = await testApp
      .post(OrganizationPaths.post)
      .set('Authorization', 'Bearer invalid token')
      .send(orgaJson);
    expect(response.status).toBe(401);
  });
});

describe('Organization Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let organizationRepo: IOrganizationEntityRepo;
  let balaneSheetEntityRepo: IBalanceSheetEntityRepo;
  const authBuilder = new AuthBuilder();
  const auth = authBuilder.addUser();
  const authNoMember = authBuilder.addUser();

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    const repoProvider = new RepoProvider(configuration);
    organizationRepo = repoProvider.getOrganizationEntityRepo(
      dataSource.manager
    );
    balaneSheetEntityRepo = repoProvider.getBalanceSheetEntityRepo(
      dataSource.manager
    );
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
    const balanceSheet = balanceSheetJsonFactory.emptyFullV508();
    const testApp = supertest(app);
    const { organizationEntity } = await new OrganizationBuilder()
      .addMember(auth.user)
      .build(dataSource);
    const response = await testApp
      .post(`${OrganizationPaths.getAll}/${organizationEntity.id}/balancesheet`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send(balanceSheet);
    expect(response.status).toBe(200);
    const balanceSheetEntity = new BalanceSheetEntity(
      response.body.id,
      balanceSheetFactory.emptyFullV508()
    );
    await balanceSheetEntity.reCalculate();
    expect(response.body).toMatchObject(balanceSheetEntity.toJson('en'));
    const response2 = await testApp
      .post(`${OrganizationPaths.getAll}/${organizationEntity.id}/balancesheet`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send(balanceSheet);
    const foundOrganizationEntity = await organizationRepo.findByIdOrFail(
      organizationEntity.id!,
      true
    );
    expect(
      foundOrganizationEntity.balanceSheetEntities?.map((b) => b.id)
    ).toEqual([response.body.id, response2.body.id]);
  });

  it('should create balance sheet of type compact', async () => {
    const testApp = supertest(app);
    const { organizationEntity } = await new OrganizationBuilder()
      .addMember(auth.user)
      .build(dataSource);
    const response = await testApp
      .post(`${OrganizationPaths.getAll}/${organizationEntity.id}/balancesheet`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send(balanceSheetJsonFactory.minimalCompactV506());
    expect(response.status).toEqual(200);
    const expectedType = balanceSheetJsonFactory.minimalCompactV506().type;
    const expectedVersion =
      balanceSheetJsonFactory.minimalCompactV506().version;
    const expectedRatings = RatingsFactory.createDefaultRatings(
      expectedType,
      expectedVersion
    );
    const balanceSheetEntity = new BalanceSheetEntity(response.body.id, {
      type: expectedType,
      version: expectedVersion,
      companyFacts: companyFactsFactory.emptyWithoutOptionalValues(),
      ratings: expectedRatings,
      stakeholderWeights: [],
    });
    expect(response.body).toMatchObject(balanceSheetEntity.toJson('en'));
  });

  describe('should create balance sheet', () => {
    const balanceSheetJson = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_8,
      companyFacts: companyFactsJsonFactory.emptyRequest(),
    };

    it('where B1 weight is very high', async () => {
      const testApp = supertest(app);
      const organizationEntity = await new OrganizationBuilder()
        .addMember(auth.user)
        .build(dataSource);
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
      };
      const response = await testApp
        .post(
          `${OrganizationPaths.getAll}/${organizationEntity.organizationEntity.id}/balancesheet`
        )
        .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
        .send(json);
      expect(response.status).toEqual(200);
      assertTopicWeight('B1', 2, response.body.ratings);
    });

    it('where B2 weight is high', async () => {
      const testApp = supertest(app);
      const organizationEntity = await new OrganizationBuilder()
        .addMember(auth.user)
        .build(dataSource);
      const json = {
        ...balanceSheetJson,
        companyFacts: {
          ...balanceSheetJson.companyFacts,
          profit: 12,
          turnover: 100,
        },
      };
      const response = await testApp
        .post(
          `${OrganizationPaths.getAll}/${organizationEntity.organizationEntity.id}/balancesheet`
        )
        .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
        .send(json);
      expect(response.status).toEqual(200);
      assertTopicWeight('B2', 1.5, response.body.ratings);
    });
    it('where B4 weight is 0.5', async () => {
      const testApp = supertest(app);
      const organizationEntity = await new OrganizationBuilder()
        .addMember(auth.user)
        .build(dataSource);
      const json = {
        ...balanceSheetJson,
        companyFacts: {
          ...balanceSheetJson.companyFacts,
          numberOfEmployees: 9,
        },
      };

      const response = await testApp
        .post(
          `${OrganizationPaths.getAll}/${organizationEntity.organizationEntity.id}/balancesheet`
        )
        .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
        .send(json);
      expect(response.status).toEqual(200);
      assertTopicWeight('B4', 0.5, response.body.ratings);
    });

    it('creates BalanceSheet where B4 weight is 1', async () => {
      const testApp = supertest(app);
      const organizationEntity = await new OrganizationBuilder()
        .addMember(auth.user)
        .build(dataSource);
      const json = {
        ...balanceSheetJson,
        companyFacts: {
          ...balanceSheetJson.companyFacts,
          numberOfEmployees: 10,
        },
      };
      const response = await testApp
        .post(
          `${OrganizationPaths.getAll}/${organizationEntity.organizationEntity.id}/balancesheet`
        )
        .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
        .send(json);
      expect(response.status).toEqual(200);
      assertTopicWeight('B4', 1, response.body.ratings);
    });
  });

  it('balance sheet creation should fail if user is not member of organization', async () => {
    const balanceSheet = balanceSheetJsonFactory.emptyFullV508();
    const testApp = supertest(app);
    const { organizationEntity } = await new OrganizationBuilder()
      .addMember(auth.user)
      .build(dataSource);

    const response = await testApp
      .post(`${OrganizationPaths.getAll}/${organizationEntity.id}/balancesheet`)
      .set(authNoMember.toHeaderPair().key, authNoMember.toHeaderPair().value)
      .send(balanceSheet);
    expect(response.status).toEqual(403);
  });

  it('creates BalanceSheet from company facts without saving results', async () => {
    const balanceSheet = balanceSheetJsonFactory.emptyFullV508();
    const testApp = supertest(app);
    const { organizationEntity } = await new OrganizationBuilder()
      .addMember(auth.user)
      .build(dataSource);
    const response = await testApp
      .post(`${OrganizationPaths.getAll}/${organizationEntity.id}/balancesheet`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .query({ save: 'false' })
      .send(balanceSheet);
    expect(response.status).toBe(200);

    const foundOrganizationEntity = await organizationRepo.findByIdOrFail(
      organizationEntity.id!,
      true
    );
    expect(foundOrganizationEntity.balanceSheetEntities).toHaveLength(0);
  });

  it('upload and save balance sheet', async () => {
    const testApp = supertest(app);
    const fileDir = path.resolve(__dirname, '../../reader/balanceSheetReader');
    const { organizationEntity } = await new OrganizationBuilder()
      .addMember(auth.user)
      .build(dataSource);
    const response = await testApp
      .post(
        `${OrganizationPaths.getAll}/${organizationEntity.id}/balancesheet/upload`
      )
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .attach('balanceSheet', path.join(fileDir, 'full_5_0_8.xlsx'));
    expect(response.status).toEqual(200);
    expect(
      response.body.ratings
        .filter((r: RatingResponseBody) => r.shortName.length === 2)
        .reduce((sum: number, current: Rating) => sum + current.maxPoints, 0)
    ).toBeCloseTo(999.9999999999998);
    const foundBalanceSheet = await balaneSheetEntityRepo.findByIdOrFail(
      response.body.id
    );
    expect(foundBalanceSheet).toBeDefined();
    const foundOrganizationEntity = await organizationRepo.findByIdOrFail(
      organizationEntity.id!,
      true
    );
    expect(
      foundOrganizationEntity.balanceSheetEntities?.map((b) => b.id)
    ).toEqual([response.body.id]);
  });

  it('should fail to upload balance sheet if user is not member of organization', async () => {
    const testApp = supertest(app);
    const fileDir = path.resolve(__dirname, '../../reader/balanceSheetReader');
    const { organizationEntity } = await new OrganizationBuilder()
      .addMember(auth.user)
      .build(dataSource);
    const response = await testApp
      .post(
        `${OrganizationPaths.getAll}/${organizationEntity.id}/balancesheet/upload`
      )
      .set(authNoMember.toHeaderPair().key, authNoMember.toHeaderPair().value)
      .attach('balanceSheet', path.join(fileDir, 'full_5_0_8.xlsx'));
    expect(response.status).toEqual(403);
  });
});
