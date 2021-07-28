import { CompanyFacts } from '../entities/companyFacts';
import { Region } from '../entities/region';
import { SupplyFraction } from '../entities/supplyFraction';
import { Industry } from '../entities/industry';
import { RegionProvider } from '../providers/region.provider';
import { IndustryProvider } from '../providers/industry.provider';

export interface SupplyCalcResults {
  supplyRiskSum: number;
  supplyChainWeight: number;
  itucAverage: number;
}

export class SupplierCalc {
  private static readonly DEFAULT_SUPPLY_CHAIN_WEIGHT = 1;
  constructor(
    private readonly regionProvider: RegionProvider,
    private readonly industryProvider: IndustryProvider
  ) {}

  public calculate(companyFacts: CompanyFacts): SupplyCalcResults {
    const supplyRiskSum = this.supplyRiskSum(companyFacts);
    let supplyChainWeight = this.supplyChainWeight(companyFacts, supplyRiskSum);
    const itucAverage = this.itucAverage(companyFacts, supplyRiskSum);
    supplyChainWeight = Number.isNaN(supplyChainWeight)
      ? SupplierCalc.DEFAULT_SUPPLY_CHAIN_WEIGHT
      : supplyChainWeight;
    return {
      supplyRiskSum: supplyRiskSum,
      supplyChainWeight: supplyChainWeight,
      itucAverage: itucAverage,
    };
  }

  // In excel this is equal to the cell $'11.Region'.G3
  public supplyRiskSum(companyFacts: CompanyFacts): number {
    let result = 0;
    for (const supplyFraction of companyFacts.supplyFractions) {
      const region: Region = this.regionProvider.getOrFail(
        supplyFraction.countryCode
      );
      result += supplyFraction.costs * region.pppIndex;
    }
    return result;
  }

  public supplyChainWeight(
    companyFacts: CompanyFacts,
    supplyRiskSum: number
  ): number {
    let result: number = 0;
    let sumOfSupplyRisk: number = 0;
    for (const supplyFraction of companyFacts.supplyFractions) {
      const supplyRisk = this.supplyRisk(supplyFraction, supplyRiskSum);
      sumOfSupplyRisk += supplyRisk;
      result += supplyRisk * this.ecologicalSupplyChainRisk(supplyFraction);
    }
    return result / sumOfSupplyRisk;
  }

  // In excel this is equal to the cell $'11.Region'.I9
  public itucAverage(
    companyFacts: CompanyFacts,
    supplyRiskSum: number
  ): number {
    let result: number = 0;
    for (const supplyFraction of companyFacts.supplyFractions) {
      const region = this.regionProvider.getOrFail(supplyFraction.countryCode);
      result += region.ituc * this.supplyRisk(supplyFraction, supplyRiskSum);
    }
    return result;
  }

  // In excel this is equal to the cell $'11.Region'.H[3-8]
  public supplyRisk(
    supplyFraction: SupplyFraction,
    supplyRiskSum: number
  ): number {
    const region: Region = this.regionProvider.getOrFail(
      supplyFraction.countryCode
    );
    return (supplyFraction.costs * region.pppIndex) / supplyRiskSum;
  }

  // In excel this is equal to the cell $'11.Region'.M[3-7]
  public ecologicalSupplyChainRisk(supplyFraction: SupplyFraction): number {
    const industry: Industry = this.industryProvider.getOrFail(
      supplyFraction.industryCode
    );
    return industry.ecologicalSupplyChainRisk;
  }
}
