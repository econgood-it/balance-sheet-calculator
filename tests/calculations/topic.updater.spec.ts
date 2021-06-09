import { TopicUpdater } from '../../src/calculations/topic.updater';
import { Topic } from '../../src/entities/topic';
import { CompanyFacts } from '../../src/entities/companyFacts';
import { Connection } from 'typeorm';
import { Region } from '../../src/entities/region';
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { ConfigurationReader } from '../../src/configuration.reader';
import { Assertions } from '../Assertions';
import * as path from 'path';
import { RatingReader } from '../../src/reader/rating.reader';
import { EmptyCompanyFacts, CompanyFacts1 } from '../testData/company.facts';
import { CalcResults, Calculator } from '../../src/calculations/calculator';
import { Industry } from '../../src/entities/industry';
import { Rating } from '../../src/entities/rating';
import { RegionProvider } from '../../src/providers/region.provider';
import { IndustryProvider } from '../../src/providers/industry.provider';

describe('Topic updater', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        ConfigurationReader.read()
      );
  });

  afterAll(async () => {
    await connection.close();
  });

  async function testCalculation(
    fileNameOfRatingInputData: string,
    fileNameOfRatingExpectedData: string,
    companyFacts: CompanyFacts
  ) {
    const testDataReader = new RatingReader();
    const testDataDir = path.resolve(__dirname, '../testData');
    let pathToCsv = path.join(testDataDir, fileNameOfRatingInputData);
    const topics: Topic[] = (await testDataReader.readRatingFromCsv(pathToCsv))
      .topics;
    const regionProvider = await RegionProvider.createFromCompanyFacts(
      companyFacts,
      connection.getRepository(Region)
    );
    const industryProvider = await IndustryProvider.createFromCompanyFacts(
      companyFacts,
      connection.getRepository(Industry)
    );
    const calcResults: CalcResults = await new Calculator(
      regionProvider,
      industryProvider
    ).calculate(companyFacts);
    const topicUpdater: TopicUpdater = new TopicUpdater();
    await topicUpdater.update(topics, companyFacts, calcResults);
    pathToCsv = path.join(testDataDir, fileNameOfRatingExpectedData);
    const expected: Topic[] = (
      await testDataReader.readRatingFromCsv(pathToCsv)
    ).topics;
    Assertions.assertTopics(topics, expected);
  }

  it('should not calculate automatic weight', async () => {
    const regionProvider = await RegionProvider.createFromCompanyFacts(
      CompanyFacts1,
      connection.getRepository(Region)
    );
    const industryProvider = await IndustryProvider.createFromCompanyFacts(
      CompanyFacts1,
      connection.getRepository(Industry)
    );
    const calcResults: CalcResults = await new Calculator(
      regionProvider,
      industryProvider
    ).calculate(CompanyFacts1);
    const topicUpdater: TopicUpdater = new TopicUpdater();
    const rating = new Rating(undefined, [
      new Topic(undefined, 'A1', 'A1 name', 0, 0, 0, 2, true, []),
    ]);
    await topicUpdater.update(rating.topics, CompanyFacts1, calcResults);
    expect(rating.topics[0].weight).toBeCloseTo(2, 2);
  });

  it('should calculate rating when the company facts values and the rating values are empty', async () =>
    testCalculation(
      'fullRating01Input.csv',
      'fullRating0Expected.csv',
      EmptyCompanyFacts
    ));

  it('should calculate rating when the company facts values filled out but estimations, and weights are not set', async () =>
    testCalculation(
      'fullRating01Input.csv',
      'fullRating1Expected.csv',
      CompanyFacts1
    ));

  it('should calculate rating when the company facts values and rating values filled out', async () =>
    testCalculation(
      'fullRating2Input.csv',
      'fullRating2Expected.csv',
      CompanyFacts1
    ));
});
