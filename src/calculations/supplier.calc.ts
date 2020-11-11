import {CompanyFacts} from "../entities/companyFacts";
import {Repository} from "typeorm";
import {Region} from "../entities/region";
import {Precalculations} from "./precalculator";
import {SupplyFraction} from "../entities/supplyFraction";
import {Industry} from "../entities/industry";

export interface SupplyAggregations {
  supplyRiskSum: number;
  industryRiskSum: number;
}

export class SupplierCalc {
  constructor(private readonly regionRepository: Repository<Region>,
              private readonly industryRepository: Repository<Industry>) {
  }

  // In excel this is equal to the cell $'11.Region'.G3
  public async supplyAggregations(companyFacts: CompanyFacts): Promise<SupplyAggregations> {
    let result: SupplyAggregations = {supplyRiskSum: 0, industryRiskSum: 0};
    for (const supplyFraction of companyFacts.supplyFractions) {
      const region: Region = await this.regionRepository.findOneOrFail({ countryCode: supplyFraction.countryCode });
      result.supplyRiskSum += supplyFraction.costs * region.pppIndex;

      const industry: Industry = await this.industryRepository.findOneOrFail(
        { industryCode: supplyFraction.industryCode });
      result.industryRiskSum += industry.ecologicalSupplyChainRisk;
    }
    return result;
  }

  // In excel this is equal to the cell $'11.Region'.H[3-8]
  public async supplyRisk(supplyFraction: SupplyFraction, precalculations: Precalculations): Promise<number> {
    const region: Region = await this.regionRepository.findOneOrFail({ countryCode: supplyFraction.countryCode });
    return (supplyFraction.costs * region.pppIndex) / precalculations.supplyRiskSum;
  }


  public async supplyChainWeight(companyFacts: CompanyFacts) {
    let result: number = 0;
    for (const supplyFraction of companyFacts.supplyFractions) {
      const region: Region = await this.regionRepository.findOneOrFail({ countryCode: supplyFraction.countryCode });
      result += supplyFraction.costs * region.pppIndex;
    }
    return result;
  }
}