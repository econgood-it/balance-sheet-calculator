import { RegionProvider } from '../providers/region.provider';
import { IndustryProvider } from '../providers/industry.provider';
import {
  OldCompanyFacts,
  MainOriginOfOtherSuppliers,
  SupplyFraction,
} from '../models/oldCompanyFacts';
import { DEFAULT_COUNTRY_CODE } from '../models/region';

export interface SupplyCalcResults {
  supplyRiskSum: number;
  supplyChainWeight: number;
  itucAverage: number;
}

export class OldSupplierCalc {
  private static readonly DEFAULT_SUPPLY_CHAIN_WEIGHT = 1;
  private static readonly DEFAULT_ITUC = 2.99;
  private static readonly DEFAULT_ITUC_AVERAGE = 0;
  // TODO: EXCEL Limitation Check what the meaning of this strange default value is
  // In excel this is equal to the cell $'11.Region'.C243
  private static readonly DEFAULT_PPP_INDEX = 1.00304566871495;
  constructor(
    private readonly regionProvider: RegionProvider,
    private readonly industryProvider: IndustryProvider
  ) {}

  public calculate(companyFacts: OldCompanyFacts): SupplyCalcResults {
    const supplyRiskSum = this.supplyRiskSum(companyFacts);
    const supplyChainWeight = this.supplyChainWeight(
      companyFacts,
      supplyRiskSum
    );
    const itucAverage = this.itucAverage(companyFacts, supplyRiskSum);
    return {
      supplyRiskSum,
      supplyChainWeight: !Number.isNaN(supplyChainWeight)
        ? supplyChainWeight
        : OldSupplierCalc.DEFAULT_SUPPLY_CHAIN_WEIGHT,
      itucAverage: !Number.isNaN(itucAverage)
        ? itucAverage
        : OldSupplierCalc.DEFAULT_ITUC_AVERAGE,
    };
  }

  /**
   * In excel this is equal to the cell $'11.Region'.G3
   * @param companyFacts
   */
  public supplyRiskSum(companyFacts: OldCompanyFacts): number {
    let result = 0;
    for (const supplyFraction of companyFacts.supplyFractions) {
      const pppIndex = supplyFraction.countryCode
        ? this.regionProvider.getOrFail(supplyFraction.countryCode).pppIndex
        : OldSupplierCalc.DEFAULT_PPP_INDEX;
      result += supplyFraction.costs * pppIndex;
    }
    const pppIndex = companyFacts.mainOriginOfOtherSuppliers.countryCode
      ? this.regionProvider.getOrFail(
          companyFacts.mainOriginOfOtherSuppliers.countryCode
        ).pppIndex
      : OldSupplierCalc.DEFAULT_PPP_INDEX;
    result += companyFacts.mainOriginOfOtherSuppliers.costs * pppIndex;

    return result;
  }

  /**
   * In excel this is equal to the cell $'11.Region'.N8
   * @param companyFacts
   * @param supplyRiskSum
   */
  public supplyChainWeight(
    companyFacts: OldCompanyFacts,
    supplyRiskSum: number
  ): number {
    // TODO: EXCEL Limitation
    if (companyFacts.supplyFractions.length < 5) {
      return OldSupplierCalc.DEFAULT_SUPPLY_CHAIN_WEIGHT;
    }

    let result: number = 0;
    let sumOfSupplyRisk: number = 0;
    for (const supplyFraction of companyFacts.supplyFractions) {
      const supplyRisk = this.supplyRisk(supplyFraction, supplyRiskSum);
      sumOfSupplyRisk += supplyRisk;
      const ecologicalSupplyChainRisk =
        this.ecologicalSupplyChainRisk(supplyFraction);
      if (!ecologicalSupplyChainRisk) {
        return OldSupplierCalc.DEFAULT_SUPPLY_CHAIN_WEIGHT;
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
  public itucAverage(
    companyFacts: OldCompanyFacts,
    supplyRiskSum: number
  ): number {
    let result: number = 0;
    for (const supplyFraction of companyFacts.supplyFractions) {
      // TODO: EXCEL Limitation: Excel does not consider ITUC of country code AWO(World)
      const ituc =
        supplyFraction.countryCode &&
        supplyFraction.countryCode !== DEFAULT_COUNTRY_CODE
          ? this.regionProvider.getOrFail(supplyFraction.countryCode).ituc
          : OldSupplierCalc.DEFAULT_ITUC;
      result += ituc * this.supplyRisk(supplyFraction, supplyRiskSum);
    }
    // TODO: EXCEL Limitation: Excel does not consider ITUC of country code AWO(World)
    const countryCode = companyFacts.mainOriginOfOtherSuppliers.countryCode;
    const ituc =
      countryCode && countryCode !== DEFAULT_COUNTRY_CODE
        ? this.regionProvider.getOrFail(countryCode).ituc
        : OldSupplierCalc.DEFAULT_ITUC;
    result +=
      ituc *
      this.supplyRisk(companyFacts.mainOriginOfOtherSuppliers, supplyRiskSum);
    return result;
  }

  /**
   * In excel this is equal to the cell $'11.Region'.H[3-8]
   * @param supplyFraction
   * @param supplyRiskSum
   */
  public supplyRisk(
    supplyFraction: SupplyFraction | MainOriginOfOtherSuppliers,
    supplyRiskSum: number
  ): number {
    const pppIndex = supplyFraction.countryCode
      ? this.regionProvider.getOrFail(supplyFraction.countryCode).pppIndex
      : OldSupplierCalc.DEFAULT_PPP_INDEX;
    return (supplyFraction.costs * pppIndex) / supplyRiskSum;
  }

  /**
   * In excel this is equal to the cell $'11.Region'.M[3-7]
   * @param supplyFraction
   */
  public ecologicalSupplyChainRisk(
    supplyFraction: SupplyFraction
  ): number | undefined {
    return supplyFraction.industryCode
      ? this.industryProvider.getOrFail(supplyFraction.industryCode)
          .ecologicalSupplyChainRisk
      : undefined;
  }
}
