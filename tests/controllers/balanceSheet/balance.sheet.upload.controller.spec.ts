import supertest from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { DatabaseSourceCreator } from '../../../src/databaseSourceCreator';
import App from '../../../src/app';
import { Application } from 'express';
import { ConfigurationReader } from '../../../src/reader/configuration.reader';

import { Auth, AuthBuilder } from '../../AuthBuilder';
import { BalanceSheetEntity } from '../../../src/entities/balance.sheet.entity';
import path from 'path';
import { Rating, RatingResponseBody } from '../../../src/models/rating';
import { RepoProvider } from '../../../src/repositories/repo.provider';

describe('Balance Sheet Controller', () => {
  let dataSource: DataSource;
  let balaneSheetRepository: Repository<BalanceSheetEntity>;
  let app: Application;
  const configuration = ConfigurationReader.read();

  let auth: Auth;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    balaneSheetRepository = dataSource.getRepository(BalanceSheetEntity);
    app = new App(dataSource, configuration, new RepoProvider(configuration))
      .app;
    auth = await new AuthBuilder(app, dataSource).build();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('creates BalanceSheet from uploaded excel file', async () => {
    const testApp = supertest(app);
    const fileDir = path.resolve(__dirname, '../../testData');
    const response = await testApp
      .post('/v1/balancesheets/upload')
      .set(auth.authHeader.key, auth.authHeader.value)
      .attach(
        'balanceSheet',
        path.join(fileDir, 'full_5_0_7_unprotected.xlsx')
      );
    expect(response.status).toEqual(200);
    expect(
      response.body.ratings
        .filter((r: RatingResponseBody) => r.shortName.length === 2)
        .reduce((sum: number, current: Rating) => sum + current.maxPoints, 0)
    ).toBeCloseTo(999.9999999999998);
    const foundBalanceSheet = await balaneSheetRepository.findOne({
      where: {
        id: response.body.id,
      },
    });
    expect(foundBalanceSheet).toBeDefined();
  });
});
