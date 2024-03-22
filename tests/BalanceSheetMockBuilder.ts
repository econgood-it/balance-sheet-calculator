import { RatingsFactory } from '../src/factories/ratings.factory';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { OldRating } from '../src/models/oldRating';
import { OldCompanyFacts } from '../src/models/oldCompanyFacts';
import { companyFactsFactory } from '../src/openapi/examples';
import { BalanceSheetCreateRequestBodySchema } from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import { z } from 'zod';
import { OldBalanceSheet } from '../src/models/oldBalanceSheet';

export class RatingsMockBuilder {
  private ratings = RatingsFactory.createDefaultRatings(
    BalanceSheetType.Full,
    BalanceSheetVersion.v5_0_8
  );

  public buildRequestBody() {
    return this.ratings.map((r) => ({
      shortName: r.shortName,
      weight: r.isWeightSelectedByUser ? r.weight : undefined,
      estimations: r.estimations,
    }));
  }

  public buildResponseBody(): OldRating[] {
    return this.build();
  }

  public build(): OldRating[] {
    return this.ratings;
  }
}

export class CompanyFactsMockBuilder {
  private companyFacts: OldCompanyFacts = companyFactsFactory.empty();

  public buildRequestBody() {
    return {
      ...this.companyFacts,
      mainOriginOfOtherSuppliers:
        this.companyFacts.mainOriginOfOtherSuppliers.countryCode,
    };
  }

  public buildResponseBody(): OldCompanyFacts {
    return this.companyFacts;
  }

  public build(): OldCompanyFacts {
    return this.companyFacts;
  }
}

export class BalanceSheetMockBuilder {
  private balanceSheet = {
    type: BalanceSheetType.Full,
    version: BalanceSheetVersion.v5_0_8,
    companyFacts: new CompanyFactsMockBuilder(),
    ratings: new RatingsMockBuilder(),
    stakeholderWeights: [],
  };

  public buildRequestBody(): z.input<
    typeof BalanceSheetCreateRequestBodySchema
  > {
    return {
      ...this.balanceSheet,
      companyFacts: this.balanceSheet.companyFacts.buildRequestBody(),
      ratings: this.balanceSheet.ratings.buildRequestBody(),
    };
  }

  public build(): OldBalanceSheet {
    return {
      ...this.balanceSheet,
      companyFacts: this.balanceSheet.companyFacts.build(),
      ratings: this.balanceSheet.ratings.build(),
    };
  }
}
