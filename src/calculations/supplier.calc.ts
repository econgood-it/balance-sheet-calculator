import {CompanyFacts} from "../entities/companyFacts";
import {Repository} from "typeorm";
import {Region} from "../entities/region";
import {CalcResults} from "./calculator";
import {SupplyFraction} from "../entities/supplyFraction";
import {Industry} from "../entities/industry";

export interface SupplyCalcResults {
  supplyRiskSum: number;
  supplyChainWeight: number;
}

export class SupplierCalc {
  constructor(private readonly regionRepository: Repository<Region>,
              private readonly industryRepository: Repository<Industry>) {
  }

  public async calculate(companyFacts: CompanyFacts): Promise<SupplyCalcResults>  {
    const supplyRiskSum = await this.supplyRiskSum(companyFacts);
    const supplyChainWeight = await this.supplyChainWeight(companyFacts, supplyRiskSum);
    return {supplyRiskSum: supplyRiskSum, supplyChainWeight: supplyChainWeight};
  }

  // In excel this is equal to the cell $'11.Region'.G3
  public async supplyRiskSum(companyFacts: CompanyFacts): Promise<number> {
    let result = 0;
    for (const supplyFraction of companyFacts.supplyFractions) {
      const region: Region = await this.regionRepository.findOneOrFail({ countryCode: supplyFraction.countryCode });
      result += supplyFraction.costs * region.pppIndex;
    }
    return result;
  }

  public async supplyChainWeight(companyFacts: CompanyFacts, supplyRiskSum: number) {
    let result: number = 0;
    let sumOfSupplyRisk: number = 0;
    for (const supplyFraction of companyFacts.supplyFractions) {
      const supplyRisk = await this.supplyRisk(supplyFraction, supplyRiskSum);
      sumOfSupplyRisk += supplyRisk;
      result += supplyRisk * await this.ecologicalSupplyChainRisk(supplyFraction);
    }
    return result / sumOfSupplyRisk;
  }

  // In excel this is equal to the cell $'11.Region'.H[3-8]
  public async supplyRisk(supplyFraction: SupplyFraction, supplyRiskSum: number): Promise<number> {
    const region: Region = await this.regionRepository.findOneOrFail({ countryCode: supplyFraction.countryCode });
    return (supplyFraction.costs * region.pppIndex) / supplyRiskSum;
  }

  // In excel this is equal to the cell $'11.Region'.M[3-7]
  public async ecologicalSupplyChainRisk(supplyFraction: SupplyFraction): Promise<number> {
    const industry: Industry = await this.industryRepository.findOneOrFail(
      {industryCode: supplyFraction.industryCode});
    return industry.ecologicalSupplyChainRisk;
  }

}