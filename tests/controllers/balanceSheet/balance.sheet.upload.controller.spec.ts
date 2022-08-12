import supertest from 'supertest';
import { Connection, Repository } from 'typeorm';
import { DatabaseConnectionCreator } from '../../../src/database.connection.creator';
import App from '../../../src/app';
import { Application } from 'express';
import { ConfigurationReader } from '../../../src/configuration.reader';

import { Rating } from '../../../src/entities/rating';
import { TokenProvider } from '../../TokenProvider';
import { BalanceSheet } from '../../../src/entities/balanceSheet';
import { RatingResponseDTO } from '../../../src/dto/response/rating.response.dto';
import path from 'path';

describe('Balance Sheet Controller', () => {
  let connection: Connection;
  let balaneSheetRepository: Repository<BalanceSheet>;
  let app: Application;
  const configuration = ConfigurationReader.read();

  const tokenHeader = {
    key: 'Authorization',
    value: '',
  };

  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        configuration
      );
    balaneSheetRepository = connection.getRepository(BalanceSheet);
    app = new App(connection, configuration).app;
    tokenHeader.value = `Bearer ${await TokenProvider.provideValidUserToken(
      app,
      connection
    )}`;
  });

  afterAll(async () => {
    await connection.close();
  });

  it('creates BalanceSheet from uploaded excel file', async () => {
    const testApp = supertest(app);
    const fileDir = path.resolve(__dirname, '../../testData');
    const response = await testApp
      .post('/v1/balancesheets/upload')
      .set(tokenHeader.key, tokenHeader.value)
      .attach(
        'balanceSheet',
        path.join(fileDir, 'full_5_0_7_unprotected.xlsx')
      );
    expect(response.status).toEqual(200);
    expect(
      response.body.ratings
        .filter((r: RatingResponseDTO) => r.shortName.length === 2)
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
