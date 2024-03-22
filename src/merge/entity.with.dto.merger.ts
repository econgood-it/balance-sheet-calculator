import { mergeRatingsWithRequestBodies } from './ratingsWithDtoMerger';
import { OldBalanceSheet, BalanceSheetSchema } from '../models/oldBalanceSheet';
import {
  OldCompanyFacts,
  CompanyFactsCreateRequestBodyTransformedSchema,
  companyFactsToResponse,
} from '../models/oldCompanyFacts';

import * as _ from 'lodash';
import { BalanceSheetPatchRequestBodySchema } from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import { z } from 'zod';
import { CompanyFactsPatchRequestBodySchema } from '@ecogood/e-calculator-schemas/dist/company.facts.dto';

function overrideArray(objValue: any, srcValue: any): any {
  if (_.isArray(srcValue)) {
    return srcValue;
  }
}

export class EntityWithDtoMerger {
  public mergeBalanceSheet(
    balanceSheet: OldBalanceSheet,
    balanceSheetPatchRequestBody: z.infer<
      typeof BalanceSheetPatchRequestBodySchema
    >
  ): OldBalanceSheet {
    return BalanceSheetSchema.parse({
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
      stakeholderWeights:
        balanceSheetPatchRequestBody.stakeholderWeights ||
        balanceSheet.stakeholderWeights,
    });
  }

  public mergeCompanyFacts(
    companyFacts: OldCompanyFacts,
    companyFactsPatchRequestBody: z.infer<
      typeof CompanyFactsPatchRequestBodySchema
    >
  ): OldCompanyFacts {
    return CompanyFactsCreateRequestBodyTransformedSchema.parse(
      _.mergeWith(
        {
          ...companyFactsToResponse(companyFacts),
          mainOriginOfOtherSuppliers:
            companyFacts.mainOriginOfOtherSuppliers.countryCode,
        },
        companyFactsPatchRequestBody,
        overrideArray
      )
    );
  }
}
