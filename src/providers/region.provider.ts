import { CompanyFacts } from '../entities/companyFacts';
import { Repository } from 'typeorm';
import Provider from './provider';
import { Region } from '../entities/region';
import { BalanceSheetVersion } from '../entities/enums';
import NotFoundException from '../exceptions/not.found.exception';
import { compare, lte } from '@mr42/version-comparator/dist/version.comparator';

export class RegionProvider extends Provider<string, Region> {
  public static createFromCompanyFacts = async (
    companyFacts: CompanyFacts,
    regionRepository: Repository<Region>,
    balanceSheetVersion: BalanceSheetVersion
  ) => {
    const regionProvider = new Provider<string, Region>();
    const countryCodes = companyFacts.getAllCountryCodes(true);
    for (const countryCode of countryCodes) {
      regionProvider.set(
        countryCode,
        RegionProvider.findRegionByVersionOrFail(
          await regionRepository.find({
            countryCode: countryCode,
          }),
          balanceSheetVersion
        )
      );
    }
    return regionProvider;
  };

  private static findRegionByVersionOrFail(
    regions: Region[],
    version: BalanceSheetVersion
  ) {
    const regionsFiltered = regions.filter((r) =>
      lte(r.validFromVersion, version)
    );
    const regionsFilteredWithDescendingVersion = regionsFiltered.sort(
      (a: Region, b: Region) => compare(b.validFromVersion, a.validFromVersion)
    );
    if (regionsFilteredWithDescendingVersion.length >= 0) {
      return regionsFilteredWithDescendingVersion[0];
    }
    throw new NotFoundException(`Region not found`);
  }
}
