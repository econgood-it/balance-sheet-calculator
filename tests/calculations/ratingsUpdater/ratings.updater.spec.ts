import { RatingsUpdater } from '../../../src/calculations/ratings.updater';

import { Assertions } from '../../Assertions';
import * as path from 'path';

import { CalcResults, Calculator } from '../../../src/calculations/calculator';
import { RegionProvider } from '../../../src/providers/region.provider';
import { IndustryProvider } from '../../../src/providers/industry.provider';
import { StakeholderWeightCalculator } from '../../../src/calculations/stakeholder.weight.calculator';
import { TopicWeightCalculator } from '../../../src/calculations/topic.weight.calculator';
import { CompanyFacts } from '../../../src/models/company.facts';
import { Rating, RatingSchema } from '../../../src/models/rating';
import { companyFactsFactory } from '../../../src/openapi/examples';
import { BalanceSheetVersion } from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import fs from 'fs';

describe('Ratings updater', () => {
  const stakeholderWeightCalculator = new StakeholderWeightCalculator();
  const topicWeightCalculator = new TopicWeightCalculator();

  async function readRatingsFromJsonFile(fileName: string): Promise<Rating[]> {
    const pathToFile = path.join(path.resolve(__dirname), fileName);
    const fileText = fs.readFileSync(pathToFile);
    const jsonParsed = JSON.parse(fileText.toString());
    return RatingSchema.array().parse(jsonParsed);
  }

  async function testCalculation(
    fileNameOfRatingInputData: string,
    fileNameOfRatingExpectedData: string,
    companyFacts: CompanyFacts
  ) {
    const ratings = await readRatingsFromJsonFile(fileNameOfRatingInputData);
    const regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    const industryProvider = await IndustryProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    const calcResults: CalcResults = await new Calculator(
      regionProvider,
      industryProvider
    ).calculate(companyFacts);

    const ratingsUpdater: RatingsUpdater = new RatingsUpdater();
    const stakeholderWeights =
      await stakeholderWeightCalculator.calcStakeholderWeights(calcResults);
    const topicWeights = topicWeightCalculator.calcTopicWeights(
      calcResults,
      companyFacts
    );
    const updatedRatings = await ratingsUpdater.update(
      ratings,
      calcResults,
      stakeholderWeights,
      topicWeights
    );

    const expected = await readRatingsFromJsonFile(
      fileNameOfRatingExpectedData
    );
    expect(updatedRatings).toHaveLength(expected.length);
    Assertions.assertRatings(updatedRatings, expected);
  }

  it('should not calculate automatic weight', async () => {
    const regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    const industryProvider = await IndustryProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );

    const companyFacts = companyFactsFactory.nonEmpty();
    const calcResults: CalcResults = await new Calculator(
      regionProvider,
      industryProvider
    ).calculate(companyFacts);
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
    const ratingsUpdater: RatingsUpdater = new RatingsUpdater();
    const stakeholderWeights =
      await stakeholderWeightCalculator.calcStakeholderWeights(calcResults);
    const topicWeights = topicWeightCalculator.calcTopicWeights(
      calcResults,
      companyFacts
    );
    const updatedRatings = await ratingsUpdater.update(
      ratings,
      calcResults,
      stakeholderWeights,
      topicWeights
    );
    expect(updatedRatings[0].weight).toBeCloseTo(2, 2);
  });

  it('should calculate rating when the company facts values and the rating values are empty', async () =>
    testCalculation(
      'emptyRatingsInput.json',
      'emptyRatingExpected.json',
      companyFactsFactory.empty()
    ));

  it('should calculate rating when the company facts values filled out but estimations, and weights are not set', async () =>
    testCalculation(
      'emptyRatingsInput.json',
      'nonEmptyCompanyFactsExpected.json',
      companyFactsFactory.nonEmpty()
    ));

  it('should calculate rating when the company facts values and rating values filled out', async () =>
    testCalculation(
      'filledRatingsInput.json',
      'filledRatingsExpected.json',
      companyFactsFactory.nonEmpty()
    ));
});
