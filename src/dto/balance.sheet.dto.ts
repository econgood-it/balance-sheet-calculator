import { BalanceSheetCreateRequestBodySchema } from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import { RatingRequestBodySchema } from '@ecogood/e-calculator-schemas/dist/rating.dto';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { z } from 'zod';
import { BalanceSheetEntity } from '../entities/balance.sheet.entity';
import { OldRatingsFactory } from '../factories/oldRatingsFactory';
import { mergeRatingsWithRequestBodies } from '../merge/ratingsWithDtoMerger';
import { BalanceSheetSchema } from '../models/oldBalanceSheet';
import { CompanyFactsCreateRequestBodyTransformedSchema } from '../models/oldCompanyFacts';
import { OldRating } from '../models/oldRating';
import { BalanceSheetDBSchema } from '../entities/schemas/balance.sheet.schema';

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
