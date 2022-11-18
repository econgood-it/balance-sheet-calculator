import { RegionProvider } from '../providers/region.provider';
import { IndustryProvider } from '../providers/industry.provider';
import { Region } from '../models/region';
import { Industry } from '../models/industry';
import {
  CompanyFacts,
  MainOriginOfOtherSuppliers,
  SupplyFraction,
} from '../models/company.facts';

export interface SupplyCalcResults {
  supplyRiskSum: number;
  supplyChainWeight: number;
  itucAverage: number;
}

export class SupplierCalc {
  private static readonly DEFAULT_SUPPLY_CHAIN_WEIGHT = 1;
  private static readonly DEFAULT_ITUC_AVERAGE = 0;
  constructor(
    private readonly regionProvider: RegionProvider,
    private readonly industryProvider: IndustryProvider
  ) {}

  public calculate(companyFacts: CompanyFacts): SupplyCalcResults {
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
        : SupplierCalc.DEFAULT_SUPPLY_CHAIN_WEIGHT,
      itucAverage: !Number.isNaN(itucAverage)
        ? itucAverage
        : SupplierCalc.DEFAULT_ITUC_AVERAGE,
    };
  }

  /**
   * In excel this is equal to the cell $'11.Region'.G3
   * @param companyFacts
   */
  public supplyRiskSum(companyFacts: CompanyFacts): number {
    let result = 0;
    for (const supplyFraction of companyFacts.supplyFractions) {
      const region: Region = this.regionProvider.getOrFail(
        supplyFraction.countryCode
      );
      result += supplyFraction.costs * region.pppIndex;
    }
    const region: Region = this.regionProvider.getOrFail(
      companyFacts.mainOriginOfOtherSuppliers.countryCode
    );
    result += companyFacts.mainOriginOfOtherSuppliers.costs * region.pppIndex;

    return result;
  }

  /**
   * In excel this is equal to the cell $'11.Region'.N8
   * @param companyFacts
   * @param supplyRiskSum
   */
  public supplyChainWeight(
    companyFacts: CompanyFacts,
    supplyRiskSum: number
  ): number {
    // TODO: EXCEL Limitation
    if (companyFacts.supplyFractions.length < 5) {
      return SupplierCalc.DEFAULT_SUPPLY_CHAIN_WEIGHT;
    }

    let result: number = 0;
    let sumOfSupplyRisk: number = 0;
    for (const supplyFraction of companyFacts.supplyFractions) {
      const supplyRisk = this.supplyRisk(supplyFraction, supplyRiskSum);
      sumOfSupplyRisk += supplyRisk;
      result += supplyRisk * this.ecologicalSupplyChainRisk(supplyFraction);
    }
    return result / sumOfSupplyRisk;
  }

  /**
   * In excel this is equal to the cell $'11.Region'.I9
   * @param companyFacts
   * @param supplyRiskSum
   */
  public itucAverage(
    companyFacts: CompanyFacts,
    supplyRiskSum: number
  ): number {
    let result: number = 0;
    for (const supplyFraction of companyFacts.supplyFractions) {
      const region = this.regionProvider.getOrFail(supplyFraction.countryCode);
      result += region.ituc * this.supplyRisk(supplyFraction, supplyRiskSum);
    }
    const region: Region = this.regionProvider.getOrFail(
      companyFacts.mainOriginOfOtherSuppliers.countryCode
    );
    result +=
      region.ituc *
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
    const region: Region = this.regionProvider.getOrFail(
      supplyFraction.countryCode
    );
    return (supplyFraction.costs * region.pppIndex) / supplyRiskSum;
  }

  /**
   * In excel this is equal to the cell $'11.Region'.M[3-7]
   * @param supplyFraction
   */
  public ecologicalSupplyChainRisk(supplyFraction: SupplyFraction): number {
    const industry: Industry = this.industryProvider.getOrFail(
      supplyFraction.industryCode
    );
    return industry.ecologicalSupplyChainRisk;
  }
}
