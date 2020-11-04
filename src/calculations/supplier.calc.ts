import {CompanyFacts} from "../entities/companyFacts";
import {Repository} from "typeorm";
import {Region} from "../entities/region";

export class SupplierCalc {
  constructor(private readonly regionRepository: Repository<Region>) {
  }

  // In excel this is equal to the cell $'11.Region'.G3
  public async supplyRisks(companyFacts: CompanyFacts): Promise<number> {
    let result: number = 0;
    for (const supplyFraction of companyFacts.supplyFractions) {
      const region: Region = await this.regionRepository.findOneOrFail({ countryCode: supplyFraction.countryCode });
      result += supplyFraction.costs * region.pppIndex;
    }
    return result;
  }
}