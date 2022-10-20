import { CompanyFacts } from '../entities/companyFacts';
import { Repository } from 'typeorm';
import Provider from './provider';
import { Region } from '../entities/region';
import { BalanceSheetVersion } from '../entities/enums';
import { compare, lte } from '@mr42/version-comparator/dist/version.comparator';
import InternalServerException from '../exceptions/internal.server.exception';
import fs from 'fs';

import { z } from 'zod';

type VersionResult = {
  validFromVersion: BalanceSheetVersion;
};

const RegionSchema = z.object({
  pppIndex: z.number(),
  countryCode: z.string(),
  countryName: z.string(),
  ituc: z.number(),
});

export class RegionProvider extends Provider<string, Region> {
  public static async fromFile(path: string) {
    const fileText = fs.readFileSync(path);
    const jsonParsed = JSON.parse(fileText.toString());
    const regions = RegionSchema.array().parse(jsonParsed);
    const regionProvider = new RegionProvider();
    for (const region of regions) {
      regionProvider.set(
        region.countryCode,
        new Region(
          undefined,
          region.pppIndex,
          region.countryCode,
          region.countryName,
          region.ituc,
          BalanceSheetVersion.v5_0_8
        )
      );
    }
    return regionProvider;
  }

  public static createFromCompanyFacts = async (
    companyFacts: CompanyFacts,
    regionRepository: Repository<Region>,
    balanceSheetVersion: BalanceSheetVersion
  ) => {
    const regionProvider = new Provider<string, Region>();
    const validFromVersion = await RegionProvider.findCorrectValidFromVersion(
      balanceSheetVersion,
      regionRepository
    );
    const countryCodes = companyFacts.getAllCountryCodes(true);
    for (const countryCode of countryCodes) {
      const foundRegion = await regionRepository.findOneOrFail({
        where: {
          countryCode,
          validFromVersion,
        },
      });
      regionProvider.set(countryCode, foundRegion);
    }
    return regionProvider;
  };

  public static async findCorrectValidFromVersion(
    version: BalanceSheetVersion,
    regionRepository: Repository<Region>
  ): Promise<BalanceSheetVersion> {
    const existingVersionsInDescendingOrder: BalanceSheetVersion[] = (
      await regionRepository.query(
        'Select distinct "validFromVersion" from region'
      )
    )
      .sort((v1: VersionResult, v2: VersionResult) =>
        compare(v2.validFromVersion, v1.validFromVersion)
      )
      .map((v: VersionResult) => v.validFromVersion);
    const correctVersion = existingVersionsInDescendingOrder.find((v) =>
      lte(v, version)
    );
    if (correctVersion) {
      return correctVersion;
    } else {
      throw new InternalServerException(`Correct version not found`);
    }
  }
}
