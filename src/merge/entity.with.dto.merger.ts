import { BalanceSheetDTOUpdate } from '../dto/update/balance.sheet.update.dto';
import { CompanyFactsDTOUpdate } from '../dto/update/company.facts.update.dto';
import { SupplyFractionDTOUpdate } from '../dto/update/supply.fraction.update.dto';

import { EmployeesFractionDTOUpdate } from '../dto/update/employees.fraction.update.dto';
import { IndustrySectorDtoUpdate } from '../dto/update/industry.sector.update.dto';
import { RatingsWithDtoMerger } from './ratingsWithDtoMerger';
import { mergeVal } from './merge.utils';
import {
  BalanceSheet,
  CompanyFacts,
  computeCostsOfMainOriginOfOtherSuppliers,
  EmployeesFraction,
  IndustrySector,
  SupplyFraction,
} from '../models/balance.sheet';

export class EntityWithDtoMerger {
  private ratingWithDtoMerger: RatingsWithDtoMerger =
    new RatingsWithDtoMerger();

  public mergeBalanceSheet(
    balanceSheet: BalanceSheet,
    balanceSheetDTOUpdate: BalanceSheetDTOUpdate
  ): BalanceSheet {
    return {
      ...balanceSheet,
      ...(balanceSheetDTOUpdate.companyFacts && {
        companyFacts: this.mergeCompanyFacts(
          balanceSheet.companyFacts,
          balanceSheetDTOUpdate.companyFacts
        ),
      }),
      ...(balanceSheetDTOUpdate.ratings.length > 0 && {
        ratings: this.ratingWithDtoMerger.mergeRatings(
          balanceSheet.ratings,
          balanceSheetDTOUpdate.ratings
        ),
      }),
    };
  }

  public mergeCompanyFacts(
    companyFacts: CompanyFacts,
    companyFactsDTOUpdate: CompanyFactsDTOUpdate
  ): CompanyFacts {
    const merged = {
      totalPurchaseFromSuppliers: mergeVal(
        companyFacts.totalPurchaseFromSuppliers,
        companyFactsDTOUpdate.totalPurchaseFromSuppliers
      ),
      totalStaffCosts: mergeVal(
        companyFacts.totalStaffCosts,
        companyFactsDTOUpdate.totalStaffCosts
      ),
      profit: mergeVal(companyFacts.profit, companyFactsDTOUpdate.profit),
      financialCosts: mergeVal(
        companyFacts.financialCosts,
        companyFactsDTOUpdate.financialCosts
      ),
      incomeFromFinancialInvestments: mergeVal(
        companyFacts.incomeFromFinancialInvestments,
        companyFactsDTOUpdate.incomeFromFinancialInvestments
      ),
      additionsToFixedAssets: mergeVal(
        companyFacts.additionsToFixedAssets,
        companyFactsDTOUpdate.additionsToFixedAssets
      ),
      turnover: mergeVal(companyFacts.turnover, companyFactsDTOUpdate.turnover),
      totalAssets: mergeVal(
        companyFacts.totalAssets,
        companyFactsDTOUpdate.totalAssets
      ),
      financialAssetsAndCashBalance: mergeVal(
        companyFacts.financialAssetsAndCashBalance,
        companyFactsDTOUpdate.financialAssetsAndCashBalance
      ),
      numberOfEmployees: mergeVal(
        companyFacts.numberOfEmployees,
        companyFactsDTOUpdate.numberOfEmployees
      ),
      hasCanteen: mergeVal(
        companyFacts.hasCanteen,
        companyFactsDTOUpdate.hasCanteen
      ),
      averageJourneyToWorkForStaffInKm: mergeVal(
        companyFacts.averageJourneyToWorkForStaffInKm,
        companyFactsDTOUpdate.averageJourneyToWorkForStaffInKm
      ),
      isB2B: mergeVal(companyFacts.isB2B, companyFactsDTOUpdate.isB2B),
      industrySectors: companyFactsDTOUpdate.industrySectors
        ? this.replaceIndustrySectors(companyFactsDTOUpdate.industrySectors)
        : companyFacts.industrySectors,
      supplyFractions: companyFactsDTOUpdate.supplyFractions
        ? this.replaceSupplyFractions(companyFactsDTOUpdate.supplyFractions)
        : companyFacts.supplyFractions,
      employeesFractions: companyFactsDTOUpdate.employeesFractions
        ? this.replaceEmployeesFractions(
            companyFactsDTOUpdate.employeesFractions
          )
        : companyFacts.employeesFractions,
      mainOriginOfOtherSuppliers: {
        costs: 0,
        countryCode: mergeVal(
          companyFacts.mainOriginOfOtherSuppliers.countryCode,
          companyFactsDTOUpdate.mainOriginOfOtherSuppliers
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
    industrySectorDTOUpdates: IndustrySectorDtoUpdate[]
  ): IndustrySector[] {
    return industrySectorDTOUpdates.map((i) => ({
      industryCode: i.industryCode,
      amountOfTotalTurnover: i.amountOfTotalTurnover,
      description: i.description,
    }));
  }

  public replaceSupplyFractions(
    supplyFractionDTOUpdates: SupplyFractionDTOUpdate[]
  ): SupplyFraction[] {
    return supplyFractionDTOUpdates.map((sf) => ({
      industryCode: sf.industryCode,
      countryCode: sf.countryCode,
      costs: sf.costs,
    }));
  }

  public replaceEmployeesFractions(
    employeesFractionDTOUpdates: EmployeesFractionDTOUpdate[]
  ): EmployeesFraction[] {
    return employeesFractionDTOUpdates.map((ef) => ({
      countryCode: ef.countryCode,
      percentage: ef.percentage,
    }));
  }
}
