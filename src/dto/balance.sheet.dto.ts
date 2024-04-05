import { BalanceSheetCreateRequestBodySchema } from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import { MatrixBodySchema } from '@ecogood/e-calculator-schemas/dist/matrix.dto';
import { RatingRequestBodySchema } from '@ecogood/e-calculator-schemas/dist/rating.dto';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { z } from 'zod';
import { calculateTotalPoints } from '../calculations/calculator';
import { Option, none, some } from '../calculations/option';
import {
  BalanceSheetDBSchema,
  BalanceSheetEntity,
} from '../entities/balance.sheet.entity';
import { OldRatingsFactory } from '../factories/oldRatingsFactory';
import { roundWithPrecision } from '../math';
import { mergeRatingsWithRequestBodies } from '../merge/ratingsWithDtoMerger';
import { OldBalanceSheet, BalanceSheetSchema } from '../models/oldBalanceSheet';
import { CompanyFactsCreateRequestBodyTransformedSchema } from '../models/oldCompanyFacts';
import { OldRating, filterTopics, sortRatings } from '../models/oldRating';

export class BalanceSheetCreateRequest {
  constructor(
    private jsonBody: z.input<typeof BalanceSheetCreateRequestBodySchema>
  ) {}

  public toBalanceEntity(): BalanceSheetEntity {
    const balanceSheet = BalanceSheetCreateRequestBodySchema.transform((b) => ({
      ...b,
      companyFacts: CompanyFactsCreateRequestBodyTransformedSchema.parse(
        b.companyFacts
      ),
      ratings: this.mergeWithDefaultRatings(b.ratings, b.type, b.version),
    }))
      .pipe(BalanceSheetSchema)
      .parse(this.jsonBody);
    return new BalanceSheetEntity(
      undefined,
      BalanceSheetDBSchema.parse(balanceSheet)
    );
  }

  private mergeWithDefaultRatings(
    ratingRequestBodies: z.infer<typeof RatingRequestBodySchema>[],
    type: BalanceSheetType,
    version: BalanceSheetVersion
  ): OldRating[] {
    const defaultRatings = OldRatingsFactory.createDefaultRatings(
      type,
      version
    );
    return mergeRatingsWithRequestBodies(defaultRatings, ratingRequestBodies);
  }
}

type MatrixBody = z.infer<typeof MatrixBodySchema>;

export class MatrixFormat {
  constructor(private balanceSheet: OldBalanceSheet) {}

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
  constructor(private rating: OldRating) {}

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
