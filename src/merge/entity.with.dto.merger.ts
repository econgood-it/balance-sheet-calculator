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
  CompanyFactsPatchRequestBody,
  EmployeesFractionRequestBody,
  IndustrySectorRequestBody,
  SupplyFractionRequestBody,
} from '../dto/company.facts.dto';

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
    const merged = {
      totalPurchaseFromSuppliers: mergeVal(
        companyFacts.totalPurchaseFromSuppliers,
        companyFactsPatchRequestBody.totalPurchaseFromSuppliers
      ),
      totalStaffCosts: mergeVal(
        companyFacts.totalStaffCosts,
        companyFactsPatchRequestBody.totalStaffCosts
      ),
      profit: mergeVal(
        companyFacts.profit,
        companyFactsPatchRequestBody.profit
      ),
      financialCosts: mergeVal(
        companyFacts.financialCosts,
        companyFactsPatchRequestBody.financialCosts
      ),
      incomeFromFinancialInvestments: mergeVal(
        companyFacts.incomeFromFinancialInvestments,
        companyFactsPatchRequestBody.incomeFromFinancialInvestments
      ),
      additionsToFixedAssets: mergeVal(
        companyFacts.additionsToFixedAssets,
        companyFactsPatchRequestBody.additionsToFixedAssets
      ),
      turnover: mergeVal(
        companyFacts.turnover,
        companyFactsPatchRequestBody.turnover
      ),
      totalAssets: mergeVal(
        companyFacts.totalAssets,
        companyFactsPatchRequestBody.totalAssets
      ),
      financialAssetsAndCashBalance: mergeVal(
        companyFacts.financialAssetsAndCashBalance,
        companyFactsPatchRequestBody.financialAssetsAndCashBalance
      ),
      numberOfEmployees: mergeVal(
        companyFacts.numberOfEmployees,
        companyFactsPatchRequestBody.numberOfEmployees
      ),
      hasCanteen: mergeVal(
        companyFacts.hasCanteen,
        companyFactsPatchRequestBody.hasCanteen
      ),
      averageJourneyToWorkForStaffInKm: mergeVal(
        companyFacts.averageJourneyToWorkForStaffInKm,
        companyFactsPatchRequestBody.averageJourneyToWorkForStaffInKm
      ),
      isB2B: mergeVal(companyFacts.isB2B, companyFactsPatchRequestBody.isB2B),
      industrySectors: companyFactsPatchRequestBody.industrySectors
        ? this.replaceIndustrySectors(
            companyFactsPatchRequestBody.industrySectors
          )
        : companyFacts.industrySectors,
      supplyFractions: companyFactsPatchRequestBody.supplyFractions
        ? this.replaceSupplyFractions(
            companyFactsPatchRequestBody.supplyFractions
          )
        : companyFacts.supplyFractions,
      employeesFractions: companyFactsPatchRequestBody.employeesFractions
        ? this.replaceEmployeesFractions(
            companyFactsPatchRequestBody.employeesFractions
          )
        : companyFacts.employeesFractions,
      mainOriginOfOtherSuppliers: {
        costs: 0,
        countryCode: mergeVal(
          companyFacts.mainOriginOfOtherSuppliers.countryCode,
          companyFactsPatchRequestBody.mainOriginOfOtherSuppliers
        ),
      },
    };
    return {
      ...merged,
      mainOriginOfOtherSuppliers: {
        ...merged.mainOriginOfOtherSuppliers,
        costs: computeCostsOfMainOriginOfOtherSuppliers(
          merged.totalPurchaseFromSuppliers,
          merged.supplyFractions
        ),
      },
    };
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
