import * as path from 'path';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import fs from 'fs';
import { makeBalanceSheet } from '../../../src/models/balance.sheet';
import { Weighting } from '../../../src/models/weighting';
import {
  CompanyFacts,
  makeCompanyFacts,
} from '../../../src/models/company.facts';
import { makeRating, Rating } from '../../../src/models/rating';
import { assertRatings } from '../../Assertions';
import { makeCompanyFactsFactory } from '../../../src/openapi/examples';

describe('Recalculation of ratings', () => {
  async function readRatingsFromJsonFile(fileName: string): Promise<Rating[]> {
    const pathToFile = path.join(path.resolve(__dirname), fileName);
    const fileText = fs.readFileSync(pathToFile);
    const jsonParsed = JSON.parse(fileText.toString());
    return jsonParsed.map((rating: any) => {
      return makeRating({
        shortName: rating.shortName,
        name: rating.name,
        type: rating.type,
        estimations: rating.estimations,
        points: rating.points,
        maxPoints: rating.maxPoints,
        weight: rating.weight,
        isWeightSelectedByUser: rating.isWeightSelectedByUser,
        isPositive: rating.isPositive,
      });
    });
  }

  async function testCalculation(
    fileNameOfRatingInputData: string,
    fileNameOfRatingExpectedData: string,
    companyFacts: CompanyFacts,
    stakeholderWeights: Weighting[]
  ) {
    const ratings = await readRatingsFromJsonFile(fileNameOfRatingInputData);
    const balanceSheet = makeBalanceSheet({
      version: BalanceSheetVersion.v5_0_8,
      type: BalanceSheetType.Full,
      companyFacts,
      ratings,
      stakeholderWeights,
    });

    const newBalanceSheet = await balanceSheet.reCalculate();

    const expected = await readRatingsFromJsonFile(
      fileNameOfRatingExpectedData
    );
    expect(newBalanceSheet.ratings).toHaveLength(expected.length);
    assertRatings(newBalanceSheet.ratings, expected);
  }

  it('with weights selected by user', async () => {
    const companyFacts = makeCompanyFactsFactory().nonEmpty();
    const ratings: Rating[] = [
      makeRating({
        shortName: 'A1',
        name: 'A1 name',
        type: 'topic',
        estimations: 0,
        points: 0,
        maxPoints: 0,
        weight: 2,
        isWeightSelectedByUser: true,
        isPositive: true,
      }),
    ];
    const balanceSheetEntity = makeBalanceSheet({
      version: BalanceSheetVersion.v5_0_8,
      type: BalanceSheetType.Full,
      companyFacts,
      ratings,
      stakeholderWeights: [],
    });

    expect(balanceSheetEntity.ratings[0].weight).toBeCloseTo(2, 2);
  });

  it('when the company facts values and the rating values are empty', async () =>
    testCalculation(
      'emptyRatingsInput.json',
      'emptyRatingExpected.json',
      makeCompanyFacts(),
      []
    ));

  it('when the company facts values filled out but estimations, and weights are not set', async () =>
    testCalculation(
      'emptyRatingsInput.json',
      'nonEmptyCompanyFactsExpected.json',
      makeCompanyFactsFactory().nonEmpty(),
      []
    ));
  //
  it('when the company facts values and rating values filled out', async () =>
    testCalculation(
      'filledRatingsInput.json',
      'filledRatingsExpected.json',
      makeCompanyFactsFactory().nonEmpty(),
      []
    ));
  //
  it('with custom stakeholder weights', async () =>
    testCalculation(
      'filledRatingsInput.json',
      'customStakeholderWeightsRatingsExpected.json',
      makeCompanyFactsFactory().nonEmpty(),
      [
        { shortName: 'A', weight: 0.5 },
        { shortName: 'C', weight: 2 },
      ]
    ));
});
