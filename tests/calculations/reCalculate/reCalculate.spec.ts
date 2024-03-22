import { Assertions } from '../../Assertions';
import * as path from 'path';
import { OldCompanyFacts } from '../../../src/models/oldCompanyFacts';
import { OldRating, RatingSchema } from '../../../src/models/oldRating';
import { companyFactsFactory } from '../../../src/openapi/examples';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import fs from 'fs';
import { BalanceSheetEntity } from '../../../src/entities/balance.sheet.entity';
import { OldStakeholderWeight } from '../../../src/models/oldStakeholderWeight';

describe('Recalculation of ratings', () => {
  async function readRatingsFromJsonFile(
    fileName: string
  ): Promise<OldRating[]> {
    const pathToFile = path.join(path.resolve(__dirname), fileName);
    const fileText = fs.readFileSync(pathToFile);
    const jsonParsed = JSON.parse(fileText.toString());
    return RatingSchema.array().parse(jsonParsed);
  }

  async function testCalculation(
    fileNameOfRatingInputData: string,
    fileNameOfRatingExpectedData: string,
    companyFacts: OldCompanyFacts,
    stakeholderWeights: OldStakeholderWeight[]
  ) {
    const ratings = await readRatingsFromJsonFile(fileNameOfRatingInputData);

    const balanceSheetEntity = new BalanceSheetEntity(undefined, {
      version: BalanceSheetVersion.v5_0_8,
      type: BalanceSheetType.Full,
      companyFacts,
      ratings,
      stakeholderWeights,
    });
    await balanceSheetEntity.reCalculate();

    const expected = await readRatingsFromJsonFile(
      fileNameOfRatingExpectedData
    );
    expect(balanceSheetEntity.ratings).toHaveLength(expected.length);
    Assertions.assertRatings(balanceSheetEntity.ratings, expected);
  }

  it('with weights selected by user', async () => {
    const companyFacts = companyFactsFactory.nonEmpty();
    const ratings: OldRating[] = [
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
    const balanceSheetEntity = new BalanceSheetEntity(undefined, {
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
      companyFactsFactory.empty(),
      []
    ));

  it('when the company facts values filled out but estimations, and weights are not set', async () =>
    testCalculation(
      'emptyRatingsInput.json',
      'nonEmptyCompanyFactsExpected.json',
      companyFactsFactory.nonEmpty(),
      []
    ));

  it('when the company facts values and rating values filled out', async () =>
    testCalculation(
      'filledRatingsInput.json',
      'filledRatingsExpected.json',
      companyFactsFactory.nonEmpty(),
      []
    ));

  it('with custom stakeholder weights', async () =>
    testCalculation(
      'filledRatingsInput.json',
      'customStakeholderWeightsRatingsExpected.json',
      companyFactsFactory.nonEmpty(),
      [
        { shortName: 'A', weight: 0.5 },
        { shortName: 'C', weight: 2 },
      ]
    ));
});
