import {CompanyFacts} from "../entities/companyFacts";
import {Repository} from "typeorm";
import {Industry} from "../entities/industry";
import Provider from "./provider";
import {Region} from "../entities/region";

export class RegionProvider extends Provider<string, Region>{
  public static createFromCompanyFacts = async (companyFacts: CompanyFacts,
                                                regionRepository: Repository<Region>) => {
    const regionProvider = new Provider<string, Region>();
    for (const supplyFraction of companyFacts.supplyFractions) {
      regionProvider.set(supplyFraction.countryCode,
        await regionRepository.findOneOrFail(
          { countryCode: supplyFraction.countryCode }));
    }
    return regionProvider;
  };
}