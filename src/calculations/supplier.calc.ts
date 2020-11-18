import {CompanyFacts} from "../entities/companyFacts";
import {Repository} from "typeorm";
import {Region} from "../entities/region";
import {CalcResults} from "./calculator";
import {SupplyFraction} from "../entities/supplyFraction";
import {Industry} from "../entities/industry";
import ExtendedMap from "./extended.map";

export interface SupplyCalcResults {
  supplyRiskSum: number;
  supplyChainWeight: number;
  itucAverage: number;
}

export class SupplierCalc {
  constructor(private readonly regionRepository: Repository<Region>,
              private readonly industryRepository: Repository<Industry>) {
  }

  public async calculate(companyFacts: CompanyFacts): Promise<SupplyCalcResults>  {
    const regions = new ExtendedMap<string, Region>();
    const industries = new ExtendedMap<string, Industry>();
    await this.loadRegionsAndIndustries(companyFacts, regions, industries)
    const supplyRiskSum = this.supplyRiskSum(companyFacts, regions);
    const supplyChainWeight = this.supplyChainWeight(companyFacts, supplyRiskSum, regions, industries);
    const itucAverge = this.itucAverage(companyFacts, supplyRiskSum, regions);
    return {supplyRiskSum: supplyRiskSum, supplyChainWeight: supplyChainWeight, itucAverage: itucAverge};
  }

  private async loadRegionsAndIndustries(companyFacts: CompanyFacts, regions: ExtendedMap<string,
    Region>, industries: ExtendedMap<string, Industry>): Promise<void> {
    for (const supplyFraction of companyFacts.supplyFractions) {
      regions.set(supplyFraction.countryCode,
        await this.regionRepository.findOneOrFail({ countryCode: supplyFraction.countryCode }));
      industries.set(supplyFraction.industryCode,
        await this.industryRepository.findOneOrFail({ industryCode: supplyFraction.industryCode }))
    }
  }

  // In excel this is equal to the cell $'11.Region'.G3
  public supplyRiskSum(companyFacts: CompanyFacts, regions: ExtendedMap<string,
    Region>): number {
    let result = 0;
    for (const supplyFraction of companyFacts.supplyFractions) {
      const region: Region = regions.getOrFail(supplyFraction.countryCode);
      result += supplyFraction.costs * region.pppIndex;
    }
    return result;
  }

  public supplyChainWeight(companyFacts: CompanyFacts, supplyRiskSum: number, regions: ExtendedMap<string,
    Region>, industries: ExtendedMap<string, Industry>): number {
    let result: number = 0;
    let sumOfSupplyRisk: number = 0;
    for (const supplyFraction of companyFacts.supplyFractions) {
      const supplyRisk = this.supplyRisk(supplyFraction, supplyRiskSum, regions);
      sumOfSupplyRisk += supplyRisk;
      result += supplyRisk * this.ecologicalSupplyChainRisk(supplyFraction, industries);
    }
    return result / sumOfSupplyRisk;
  }

  public itucAverage(companyFacts: CompanyFacts, supplyRiskSum: number, regions: ExtendedMap<string,
    Region>): number {
    let result: number = 0;
    for (const supplyFraction of companyFacts.supplyFractions) {
      const region = regions.getOrFail(supplyFraction.countryCode);
      result += region.ituc * this.supplyRisk(supplyFraction, supplyRiskSum, regions);
    }
    return result;
  }

  // In excel this is equal to the cell $'11.Region'.H[3-8]
  public supplyRisk(supplyFraction: SupplyFraction, supplyRiskSum: number, regions: ExtendedMap<string,
    Region>): number {
    const region: Region = regions.getOrFail(supplyFraction.countryCode);
    return (supplyFraction.costs * region.pppIndex) / supplyRiskSum;
  }

  // In excel this is equal to the cell $'11.Region'.M[3-7]
  public ecologicalSupplyChainRisk(supplyFraction: SupplyFraction,
                                         industries: ExtendedMap<string, Industry>): number {
    const industry: Industry = industries.getOrFail(supplyFraction.industryCode);
    return industry.ecologicalSupplyChainRisk;
  }

}