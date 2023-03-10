import { mergeRatingsWithRequestBodies } from './ratingsWithDtoMerger';
import { BalanceSheet } from '../models/balance.sheet';
import { CompanyFacts } from '../models/company.facts';
import { BalanceSheetPatchRequestBody } from '../dto/balance.sheet.dto';
import {
  CompanyFactsCreateRequestBodyTransformedSchema,
  CompanyFactsPatchRequestBody,
} from '../dto/company.facts.dto';
import * as _ from 'lodash';

function overrideArray(objValue: any, srcValue: any): any {
  if (_.isArray(srcValue)) {
    return srcValue;
  }
}

export class EntityWithDtoMerger {
  public mergeBalanceSheet(
    balanceSheet: BalanceSheet,
    balanceSheetPatchRequestBody: BalanceSheetPatchRequestBody
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
    companyFactsPatchRequestBody: CompanyFactsPatchRequestBody
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
