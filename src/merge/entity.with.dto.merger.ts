import { RatingsWithDtoMerger } from './ratingsWithDtoMerger';
import { mergeVal } from './merge.utils';
import { BalanceSheet } from '../models/balance.sheet';
import {
  CompanyFacts,
  computeCostsOfMainOriginOfOtherSuppliers,
  EmployeesFraction,
  IndustrySector,
  SupplyFraction,
} from '../models/company.facts';
import { BalanceSheetPatchRequestBody } from '../dto/balance.sheet.dto';
import {
  CompanyFactsCreateRequestBodySchema,
  CompanyFactsPatchRequestBody,
  EmployeesFractionRequestBody,
  IndustrySectorRequestBody,
  SupplyFractionRequestBody,
} from '../dto/company.facts.dto';
import * as _ from 'lodash';

function overrideArray(objValue: any, srcValue: any): any {
  if (_.isArray(srcValue)) {
    return srcValue;
  }
}

export class EntityWithDtoMerger {
  private ratingWithDtoMerger: RatingsWithDtoMerger =
    new RatingsWithDtoMerger();

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
        ratings: this.ratingWithDtoMerger.mergeRatings(
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
    return CompanyFactsCreateRequestBodySchema.parse(
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

  public replaceIndustrySectors(
    industrySectorRequestBodies: IndustrySectorRequestBody[]
  ): IndustrySector[] {
    return industrySectorRequestBodies.map((i) => ({
      industryCode: i.industryCode,
      amountOfTotalTurnover: i.amountOfTotalTurnover,
      description: i.description,
    }));
  }

  public replaceSupplyFractions(
    supplyFractionRequestBodies: SupplyFractionRequestBody[]
  ): SupplyFraction[] {
    return supplyFractionRequestBodies.map((sf) => ({
      industryCode: sf.industryCode,
      countryCode: sf.countryCode,
      costs: sf.costs,
    }));
  }

  public replaceEmployeesFractions(
    employeesFractionRequestBodies: EmployeesFractionRequestBody[]
  ): EmployeesFraction[] {
    return employeesFractionRequestBodies.map((ef) => ({
      countryCode: ef.countryCode,
      percentage: ef.percentage,
    }));
  }
}
