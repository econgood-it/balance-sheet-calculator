import { CompanyFacts } from '../entities/companyFacts';
import { Repository } from 'typeorm';
import Provider from './provider';
import { Region } from '../entities/region';
import { BalanceSheetVersion } from '../entities/enums';
import { compare, lte } from '@mr42/version-comparator/dist/version.comparator';
import NotFoundException from '../exceptions/not.found.exception';

export class RegionProvider extends Provider<string, Region> {
  public static createFromCompanyFacts = async (
    companyFacts: CompanyFacts,
    regionRepository: Repository<Region>,
    balanceSheetVersion: BalanceSheetVersion
  ) => {
    const regionProvider = new Provider<string, Region>();
    const countryCodes = companyFacts.getAllCountryCodes(true);
    for (const countryCode of countryCodes) {
      const foundRegion = RegionProvider.findRegionByVersion(
        await regionRepository.find({
          countryCode: countryCode,
        }),
        balanceSheetVersion
      );
      if (foundRegion) {
        regionProvider.set(countryCode, foundRegion);
      } else {
        throw new NotFoundException(`Region ${countryCode} not found`);
      }
    }
    return regionProvider;
  };

  private static findRegionByVersion(
    regions: Region[],
    version: BalanceSheetVersion
  ): Region | undefined {
    const regionsFiltered = regions.filter((r) =>
      lte(r.validFromVersion, version)
    );
    const regionsFilteredWithDescendingVersion = regionsFiltered.sort(
      (a: Region, b: Region) => compare(b.validFromVersion, a.validFromVersion)
    );
    if (regionsFilteredWithDescendingVersion.length > 0) {
      return regionsFilteredWithDescendingVersion[0];
    }
    return undefined;
  }
}
