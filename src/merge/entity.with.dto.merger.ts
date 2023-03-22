import { mergeRatingsWithRequestBodies } from './ratingsWithDtoMerger';
import { BalanceSheet } from '../models/balance.sheet';
import {
  CompanyFacts,
  CompanyFactsCreateRequestBodyTransformedSchema,
} from '../models/company.facts';

import * as _ from 'lodash';
import { BalanceSheetPatchRequestBodySchema } from 'e-calculator-schemas/dist/balance.sheet.dto';
import { z } from 'zod';
import { CompanyFactsPatchRequestBodySchema } from 'e-calculator-schemas/dist/company.facts.dto';

function overrideArray(objValue: any, srcValue: any): any {
  if (_.isArray(srcValue)) {
    return srcValue;
  }
}

export class EntityWithDtoMerger {
  public mergeBalanceSheet(
    balanceSheet: BalanceSheet,
    balanceSheetPatchRequestBody: z.infer<
      typeof BalanceSheetPatchRequestBodySchema
    >
  ): BalanceSheet {
    return {
      ...balanceSheet,
      ...(balanceSheetPatchRequestBody.companyFacts && {
        companyFacts: this.mergeCompanyFacts(
          balanceSheet.companyFacts,
          balanceSheetPatchRequestBody.companyFacts
        ),
      }),
      ...(balanceSheetPatchRequestBody.ratings.length > 0 && {
        ratings: mergeRatingsWithRequestBodies(
          balanceSheet.ratings,
          balanceSheetPatchRequestBody.ratings
        ),
      }),
    };
  }

  public mergeCompanyFacts(
    companyFacts: CompanyFacts,
    companyFactsPatchRequestBody: z.infer<
      typeof CompanyFactsPatchRequestBodySchema
    >
  ): CompanyFacts {
    return CompanyFactsCreateRequestBodyTransformedSchema.parse(
      _.mergeWith(
        {
          ...companyFacts,
          mainOriginOfOtherSuppliers:
            companyFacts.mainOriginOfOtherSuppliers.countryCode,
        },
        companyFactsPatchRequestBody,
        overrideArray
      )
    );
  }
}
