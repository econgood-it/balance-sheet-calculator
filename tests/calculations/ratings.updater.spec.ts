import { RatingsUpdater } from '../../src/calculations/ratings.updater';

import { Assertions } from '../Assertions';
import * as path from 'path';
import { RatingsReader } from '../../src/reader/ratings.reader';

import { CalcResults, Calculator } from '../../src/calculations/calculator';
import { RegionProvider } from '../../src/providers/region.provider';
import { IndustryProvider } from '../../src/providers/industry.provider';
import { StakeholderWeightCalculator } from '../../src/calculations/stakeholder.weight.calculator';
import { TopicWeightCalculator } from '../../src/calculations/topic.weight.calculator';
import {
  BalanceSheet,
  BalanceSheetType,
  BalanceSheetVersion,
} from '../../src/models/balance.sheet';
import { CompanyFacts } from '../../src/models/company.facts';
import { Rating } from '../../src/models/rating';
import { companyFactsFactory } from '../../src/openapi/examples';

describe('Ratings updater', () => {
  const stakeholderWeightCalculator = new StakeholderWeightCalculator();
  const topicWeightCalculator = new TopicWeightCalculator();

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
    const regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_4
    );
    const industryProvider = await IndustryProvider.fromVersion(
      BalanceSheetVersion.v5_0_4
    );
    const calcResults: CalcResults = await new Calculator(
      regionProvider,
      industryProvider
    ).calculate(companyFacts);
    const balanceSheet = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_4,
      companyFacts,
      ratings,
    };

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
    const regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_4
    );
    const industryProvider = await IndustryProvider.fromVersion(
      BalanceSheetVersion.v5_0_4
    );

    const calcResults: CalcResults = await new Calculator(
      regionProvider,
      industryProvider
    ).calculate(companyFactsFactory.nonEmpty());
    const ratings: Rating[] = [
      {
        shortName: 'A1',
        name: 'A1 name',
        estimations: 0,
        points: 0,
        maxPoints: 0,
        weight: 2,
        isWeightSelectedByUser: true,
        isPositive: true,
      },
    ];
    const balanceSheet: BalanceSheet = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_4,
      companyFacts: companyFactsFactory.nonEmpty(),
      ratings,
    };
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
      companyFactsFactory.empty()
    ));

  it('should calculate rating when the company facts values filled out but estimations, and weights are not set', async () =>
    testCalculation(
      'fullRating01Input.csv',
      'fullRating1Expected.csv',
      companyFactsFactory.nonEmpty()
    ));

  it('should calculate rating when the company facts values and rating values filled out', async () =>
    testCalculation(
      'fullRating2Input.csv',
      'fullRating2Expected.csv',
      companyFactsFactory.nonEmpty()
    ));
});
