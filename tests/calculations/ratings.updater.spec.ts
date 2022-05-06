import { RatingsUpdater } from '../../src/calculations/ratings.updater';
import { Rating } from '../../src/entities/rating';
import { CompanyFacts } from '../../src/entities/companyFacts';
import { Connection } from 'typeorm';
import { Region } from '../../src/entities/region';
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { ConfigurationReader } from '../../src/configuration.reader';
import { Assertions } from '../Assertions';
import * as path from 'path';
import { RatingsReader } from '../../src/reader/ratings.reader';
import { CompanyFacts1, EmptyCompanyFacts } from '../testData/company.facts';
import { CalcResults, Calculator } from '../../src/calculations/calculator';
import { Industry } from '../../src/entities/industry';
import { RegionProvider } from '../../src/providers/region.provider';
import { IndustryProvider } from '../../src/providers/industry.provider';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '../../src/entities/enums';
import { BalanceSheet } from '../../src/entities/balanceSheet';
import { StakeholderWeightCalculator } from '../../src/calculations/stakeholder.weight.calculator';
import { TopicWeightCalculator } from '../../src/calculations/topic.weight.calculator';

describe('Ratings updater', () => {
  let connection: Connection;
  const stakeholderWeightCalculator = new StakeholderWeightCalculator();
  const topicWeightCalculator = new TopicWeightCalculator();

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
    const testDataReader = new RatingsReader();
    const testDataDir = path.resolve(__dirname, '../testData');
    let pathToCsv = path.join(testDataDir, fileNameOfRatingInputData);
    const ratings: Rating[] = await testDataReader.readRatingsFromCsv(
      pathToCsv
    );
    const regionProvider = await RegionProvider.createFromCompanyFacts(
      companyFacts,
      connection.getRepository(Region),
      BalanceSheetVersion.v5_0_4
    );
    const industryProvider = await IndustryProvider.createFromCompanyFacts(
      companyFacts,
      connection.getRepository(Industry)
    );
    const calcResults: CalcResults = await new Calculator(
      regionProvider,
      industryProvider
    ).calculate(companyFacts);
    const balanceSheet = new BalanceSheet(
      undefined,
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_4,
      companyFacts,
      ratings,
      []
    );
    const ratingsUpdater: RatingsUpdater = new RatingsUpdater();
    const stakeholderWeights =
      await stakeholderWeightCalculator.calcStakeholderWeights(calcResults);
    const topicWeights = topicWeightCalculator.calcTopicWeights(
      calcResults,
      balanceSheet.companyFacts
    );
    const updatedBalanceSheet = await ratingsUpdater.update(
      balanceSheet,
      calcResults,
      stakeholderWeights,
      topicWeights
    );
    pathToCsv = path.join(testDataDir, fileNameOfRatingExpectedData);
    const expected: Rating[] = await testDataReader.readRatingsFromCsv(
      pathToCsv
    );
    Assertions.assertRatings(updatedBalanceSheet.ratings, expected);
  }

  it('should not calculate automatic weight', async () => {
    const regionProvider = await RegionProvider.createFromCompanyFacts(
      CompanyFacts1,
      connection.getRepository(Region),
      BalanceSheetVersion.v5_0_4
    );
    const industryProvider = await IndustryProvider.createFromCompanyFacts(
      CompanyFacts1,
      connection.getRepository(Industry)
    );
    const calcResults: CalcResults = await new Calculator(
      regionProvider,
      industryProvider
    ).calculate(CompanyFacts1);
    const ratings = [
      new Rating(undefined, 'A1', 'A1 name', 0, 0, 0, 2, true, true),
    ];
    const balanceSheet = new BalanceSheet(
      undefined,
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_4,
      CompanyFacts1,
      ratings,
      []
    );
    const ratingsUpdater: RatingsUpdater = new RatingsUpdater();
    const stakeholderWeights =
      await stakeholderWeightCalculator.calcStakeholderWeights(calcResults);
    const topicWeights = topicWeightCalculator.calcTopicWeights(
      calcResults,
      balanceSheet.companyFacts
    );
    const updatedBalanceSheet = await ratingsUpdater.update(
      balanceSheet,
      calcResults,
      stakeholderWeights,
      topicWeights
    );
    expect(updatedBalanceSheet.ratings[0].weight).toBeCloseTo(2, 2);
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
