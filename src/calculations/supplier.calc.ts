import {CompanyFacts} from "../entities/companyFacts";
import {Repository} from "typeorm";
import {Region} from "../entities/region";
import {Precalculations} from "./precalculator";
import {SupplyFraction} from "../entities/supplyFraction";

export class SupplierCalc {
  constructor(private readonly regionRepository: Repository<Region>) {
  }

  // In excel this is equal to the cell $'11.Region'.G3
  public async supplyRiskSum(companyFacts: CompanyFacts): Promise<number> {
    let result: number = 0;
    for (const supplyFraction of companyFacts.supplyFractions) {
      const region: Region = await this.regionRepository.findOneOrFail({ countryCode: supplyFraction.countryCode });
      result += supplyFraction.costs * region.pppIndex;
    }
    return result;
  }

  // In excel this is equal to the cell $'11.Region'.H[3-8]
  public async supplyRisk(supplyFraction: SupplyFraction, precalculations: Precalculations): Promise<number> {
    const region: Region = await this.regionRepository.findOneOrFail({ countryCode: supplyFraction.countryCode });
    return (supplyFraction.costs * region.pppIndex) / precalculations.supplyRiskSum;
  }
}