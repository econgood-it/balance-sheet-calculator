import { RegionProvider } from '../providers/region.provider';
import { IndustryProvider } from '../providers/industry.provider';

import { DEFAULT_COUNTRY_CODE } from '../models/region';
import {
  CompanyFacts,
  MainOriginOfOtherSuppliers,
  SupplyFraction,
} from '../models/company.facts';
import deepFreeze from 'deep-freeze';
import { BalanceSheetVersion } from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { gte } from 'lodash';

export interface SupplyCalcResults {
  supplyRiskSum: number;
  supplyChainWeight: number;
  itucAverage: number;
}

export function makeSupplierCalc(
  regionProvider: RegionProvider,
  industryProvider: IndustryProvider,
  balanceSheetVersion: BalanceSheetVersion
) {
  const DEFAULT_SUPPLY_CHAIN_WEIGHT = 1;
  const DEFAULT_ITUC = 2.99;
  const DEFAULT_ITUC_AVERAGE = 0;
  // TODO: EXCEL Limitation Check what the meaning of this strange default value is
  // In excel this is equal to the cell $'11.Region'.C243
  const DEFAULT_PPP_INDEX = 1.00304566871495;

  function calculate(companyFacts: CompanyFacts): SupplyCalcResults {
    const supplyRiskSum = calculateSupplyRiskSum(companyFacts);
    const supplyChainWeight = calculateSupplyChainWeight(
      companyFacts,
      supplyRiskSum
    );
    const itucAverage = calculateItucAverage(companyFacts, supplyRiskSum);
    return {
      supplyRiskSum,
      supplyChainWeight: !Number.isNaN(supplyChainWeight)
        ? supplyChainWeight
        : DEFAULT_SUPPLY_CHAIN_WEIGHT,
      itucAverage: !Number.isNaN(itucAverage)
        ? itucAverage
        : DEFAULT_ITUC_AVERAGE,
    };
  }

  /**
   * In excel this is equal to the cell $'11.Region'.G3
   * @param companyFacts
   */
  function calculateSupplyRiskSum(companyFacts: CompanyFacts): number {
    let result = 0;
    for (const supplyFraction of companyFacts.supplyFractions) {
      const pppIndex = supplyFraction.countryCode
        ? regionProvider.getOrFail(supplyFraction.countryCode).pppIndex
        : DEFAULT_PPP_INDEX;
      result += supplyFraction.costs * pppIndex;
    }
    const pppIndex = companyFacts.mainOriginOfOtherSuppliers.countryCode
      ? regionProvider.getOrFail(
          companyFacts.mainOriginOfOtherSuppliers.countryCode
        ).pppIndex
      : DEFAULT_PPP_INDEX;
    result += companyFacts.mainOriginOfOtherSuppliers.costs * pppIndex;

    return result;
  }

  /**
   * In excel this is equal to the cell $'11.Region'.N8
   * @param companyFacts
   * @param supplyRiskSum
   */
  function calculateSupplyChainWeight(
    companyFacts: CompanyFacts,
    supplyRiskSum: number
  ): number {
    // TODO: EXCEL Limitation
    if (companyFacts.supplyFractions.length < 5) {
      return DEFAULT_SUPPLY_CHAIN_WEIGHT;
    }

    let result: number = 0;
    let sumOfSupplyRisk: number = 0;
    for (const supplyFraction of companyFacts.supplyFractions) {
      const supplyRisk = calculateSupplyRisk(supplyFraction, supplyRiskSum);
      sumOfSupplyRisk += supplyRisk;
      const ecologicalSupplyChainRisk =
        calculateEcologicalSupplyChainRisk(supplyFraction);
      if (!ecologicalSupplyChainRisk) {
        return DEFAULT_SUPPLY_CHAIN_WEIGHT;
      } else {
        result += supplyRisk * ecologicalSupplyChainRisk;
      }
    }
    return result / sumOfSupplyRisk;
  }

  /**
   * In excel this is equal to the cell $'11.Region'.I9
   * @param companyFacts
   * @param supplyRiskSum
   */
  function calculateItucAverage(
    companyFacts: CompanyFacts,
    supplyRiskSum: number
  ): number {
    let result: number = 0;
    // TODO: EXCEL Limitation: Excel does not consider ITUC of country code AWO(World) for versions < 5.0.9
    const getITUC = (countryCode: string | undefined) => {
      return countryCode &&
        (gte(balanceSheetVersion, BalanceSheetVersion.v5_0_9) ||
          countryCode !== DEFAULT_COUNTRY_CODE)
        ? regionProvider.getOrFail(countryCode).ituc
        : DEFAULT_ITUC;
    };
    for (const supplyFraction of companyFacts.supplyFractions) {
      result +=
        getITUC(supplyFraction.countryCode) *
        calculateSupplyRisk(supplyFraction, supplyRiskSum);
    }
    const countryCode = companyFacts.mainOriginOfOtherSuppliers.countryCode;

    result +=
      getITUC(countryCode) *
      calculateSupplyRisk(
        companyFacts.mainOriginOfOtherSuppliers,
        supplyRiskSum
      );
    return result;
  }

  /**
   * In excel this is equal to the cell $'11.Region'.H[3-8]
   * @param supplyFraction
   * @param supplyRiskSum
   */
  function calculateSupplyRisk(
    supplyFraction: SupplyFraction | MainOriginOfOtherSuppliers,
    supplyRiskSum: number
  ): number {
    const pppIndex = supplyFraction.countryCode
      ? regionProvider.getOrFail(supplyFraction.countryCode).pppIndex
      : DEFAULT_PPP_INDEX;
    return (supplyFraction.costs * pppIndex) / supplyRiskSum;
  }

  /**
   * In excel this is equal to the cell $'11.Region'.M[3-7]
   * @param supplyFraction
   */
  function calculateEcologicalSupplyChainRisk(
    supplyFraction: SupplyFraction
  ): number | undefined {
    return supplyFraction.industryCode
      ? industryProvider.getOrFail(supplyFraction.industryCode)
          .ecologicalSupplyChainRisk
      : undefined;
  }

  return deepFreeze({
    calculate,
    calculateSupplyRiskSum,
    calculateSupplyRisk,
    calculateItucAverage,
    calculateSupplyChainWeight,
    calculateEcologicalSupplyChainRisk,
  });
}
