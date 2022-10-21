import Provider from './provider';
import { Region } from '../entities/region';
import { BalanceSheetVersion } from '../entities/enums';
import fs from 'fs';

import { z } from 'zod';
import path from 'path';

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

  public static async fromVersion(version: BalanceSheetVersion) {
    const regionFileName =
      version === BalanceSheetVersion.v5_0_4
        ? 'regions_5_0_4.json'
        : 'regions_5_0_5.json';
    const regionPath = path.join(
      path.resolve(__dirname, '../files/providers'),
      regionFileName
    );
    return RegionProvider.fromFile(regionPath);
  }
}
