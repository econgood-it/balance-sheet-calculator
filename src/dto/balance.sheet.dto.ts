import { z } from 'zod';
import { BalanceSheetCreateRequestBodySchema } from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import { BalanceSheetEntity } from '../entities/balance.sheet.entity';
import { RatingRequestBodySchema } from '@ecogood/e-calculator-schemas/dist/rating.dto';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { filterTopics, Rating, sortRatings } from '../models/rating';
import { RatingsFactory } from '../factories/ratings.factory';
import { mergeRatingsWithRequestBodies } from '../merge/ratingsWithDtoMerger';
import { CompanyFactsCreateRequestBodyTransformedSchema } from '../models/company.facts';
import { BalanceSheet, BalanceSheetSchema } from '../models/balance.sheet';
import { User } from '../entities/user';
import { MatrixBodySchema } from '@ecogood/e-calculator-schemas/dist/matrix.dto';
import { calculateTotalPoints } from '../calculations/calculator';
import { roundWithPrecision } from '../math';
import { none, Option, some } from '../calculations/option';

export class BalanceSheetCreateRequest {
  constructor(
    private jsonBody: z.input<typeof BalanceSheetCreateRequestBodySchema>
  ) {}

  public toBalanceEntity(users: User[]): BalanceSheetEntity {
    const balanceSheet = BalanceSheetCreateRequestBodySchema.transform((b) => ({
      ...b,
      companyFacts: CompanyFactsCreateRequestBodyTransformedSchema.parse(
        b.companyFacts
      ),
      ratings: this.mergeWithDefaultRatings(b.ratings, b.type, b.version),
    }))
      .pipe(BalanceSheetSchema)
      .parse(this.jsonBody);
    return new BalanceSheetEntity(undefined, balanceSheet, users);
  }

  private mergeWithDefaultRatings(
    ratingRequestBodies: z.infer<typeof RatingRequestBodySchema>[],
    type: BalanceSheetType,
    version: BalanceSheetVersion
  ): Rating[] {
    const defaultRatings = RatingsFactory.createDefaultRatings(type, version);
    return mergeRatingsWithRequestBodies(defaultRatings, ratingRequestBodies);
  }
}

type MatrixBody = z.infer<typeof MatrixBodySchema>;

export class MatrixFormat {
  constructor(private balanceSheet: BalanceSheet) {}

  public apply(): MatrixBody {
    return MatrixBodySchema.parse({
      ratings: filterTopics(sortRatings(this.balanceSheet.ratings)).map((r) =>
        new MatrixRatingFormat(r).apply()
      ),
      totalPoints: calculateTotalPoints(this.balanceSheet.ratings),
    });
  }
}

export class MatrixRatingFormat {
  constructor(private rating: Rating) {}

  public apply() {
    const percentage = this.calcPercentage(
      this.rating.points,
      this.rating.maxPoints
    );
    const percentageReached = percentage.isPresent()
      ? percentage.get()
      : undefined;
    return {
      shortName: this.rating.shortName,
      name: this.rating.name,
      points: roundWithPrecision(this.rating.points),
      maxPoints: roundWithPrecision(this.rating.maxPoints),
      percentageReached,
      notApplicable: this.notApplicable(this.rating.weight),
    };
  }

  private calcPercentage(points: number, maxPoints: number): Option<number> {
    if (maxPoints === 0 || points < 0) {
      return none();
    }
    return some(roundWithPrecision(points / maxPoints, 1) * 100);
  }

  private notApplicable(weight: number): boolean {
    return weight === 0;
  }
}
