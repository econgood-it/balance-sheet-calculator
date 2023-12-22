import { RatingsFactory } from '../src/factories/ratings.factory';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { Rating } from '../src/models/rating';
import { CompanyFacts } from '../src/models/company.facts';
import { companyFactsFactory } from '../src/openapi/examples';
import _ from 'lodash';
import { BalanceSheetCreateRequestBodySchema } from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import { z } from 'zod';
import { BalanceSheet } from '../src/models/balance.sheet';
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

  public buildResponseBody(): Rating[] {
    return this.build();
  }

  public build(): Rating[] {
    return this.ratings;
  }
}

export class CompanyFactsMockBuilder {
  private companyFacts: CompanyFacts = companyFactsFactory.empty();

  public buildRequestBody() {
    return {
      ...this.companyFacts,
      mainOriginOfOtherSuppliers:
        this.companyFacts.mainOriginOfOtherSuppliers.countryCode,
    };
  }

  public buildResponseBody(): CompanyFacts {
    return this.companyFacts;
  }

  public build(): CompanyFacts {
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

  public build(): BalanceSheet {
    return {
      ...this.balanceSheet,
      companyFacts: this.balanceSheet.companyFacts.build(),
      ratings: this.balanceSheet.ratings.build(),
    };
  }
}
