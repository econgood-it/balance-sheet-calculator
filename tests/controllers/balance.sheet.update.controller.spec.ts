import supertest from 'supertest';
import { Connection } from 'typeorm';
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import App from '../../src/app';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/configuration.reader';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '../../src/entities/enums';
import { CompanyFacts1 } from '../testData/company.facts';
import { Topic } from '../../src/entities/topic';

describe('Update endpoint of Balance Sheet Controller', () => {
  let connection: Connection;
  let app: Application;
  const configuration = ConfigurationReader.read();
  const endpointPath = '/v1/balancesheets';
  beforeAll(async (done) => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        configuration
      );
    app = new App(connection, configuration).app;
    done();
  });

  afterAll(async (done) => {
    await connection.close();
    done();
  });

  it('should update company facts of balance sheet', async (done) => {
    const testApp = supertest(app);

    let response = await testApp
      .post(endpointPath)
      .auth(configuration.appUsername, configuration.appPassword)
      .send({
        type: BalanceSheetType.Compact,
        version: BalanceSheetVersion.v5_0_4,
        companyFacts: CompanyFacts1,
      });
    const balanceSheetUpdate = {
      id: response.body.id,
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
          { countryCode: 'GBR', percentage: 0.2 },
          { countryCode: 'BEL', percentage: 0.4 },
        ],
        industrySectors: [],
      },
    };
    response = await testApp
      .patch(`${endpointPath}/${response.body.id}`)
      .auth(configuration.appUsername, configuration.appPassword)
      .send({ ...balanceSheetUpdate });
    expect(response.status).toEqual(200);
    expect(response.body.companyFacts).toMatchObject(
      balanceSheetUpdate.companyFacts
    );
    done();
  });

  it('should update rating of full balance sheet', async (done) => {
    await testEstimationsUpdate(BalanceSheetType.Full);
    done();
  });

  it('should update rating of compact balance sheet', async (done) => {
    await testEstimationsUpdate(BalanceSheetType.Compact);
    done();
  });

  async function testEstimationsUpdate(
    balanceSheetType: BalanceSheetType
  ): Promise<void> {
    const testApp = supertest(app);

    let response = await testApp
      .post(endpointPath)
      .auth(configuration.appUsername, configuration.appPassword)
      .send({
        type: balanceSheetType,
        version: BalanceSheetVersion.v5_0_4,
        companyFacts: CompanyFacts1,
      });
    const balanceSheetUpdate = {
      id: response.body.id,
      rating: {
        topics: [
          {
            shortName: 'A1',
            aspects: [
              {
                shortName: 'A1.1',
                estimations: 6,
              },
              {
                shortName: 'A1.2',
                estimations: -200,
              },
            ],
          },
        ],
      },
    };
    response = await testApp
      .patch(`${endpointPath}/${response.body.id}`)
      .auth(configuration.appUsername, configuration.appPassword)
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

  function findAspect(shortName: string, response: any): Topic | undefined {
    const shortNameTopic = shortName.split('.')[0];
    return response.body.rating.topics
      .find((t: { shortName: string }) => t.shortName === shortNameTopic)
      .aspects.find((a: { shortName: string }) => a.shortName === shortName);
  }
});
