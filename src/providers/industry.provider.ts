import Provider from "./provider";
import {Industry} from "../entities/industry";
import {Repository} from "typeorm";
import {CompanyFacts} from "../entities/companyFacts";

export class IndustryProvider extends Provider<string, Industry>{
  public static createFromCompanyFacts = async (companyFacts: CompanyFacts,
                                                industryRepository: Repository<Industry>) => {
    const industryProvider = new Provider<string, Industry>();
    for (const supplyFraction of companyFacts.supplyFractions) {
      industryProvider.set(supplyFraction.industryCode,
        await industryRepository.findOneOrFail({industryCode: supplyFraction.industryCode}))
    }
    return industryProvider;
  };
}