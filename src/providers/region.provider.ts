import Provider from './provider';
import fs from 'fs';

import path from 'path';
import { Region, RegionSchema } from '../models/region';
import { BalanceSheetVersion } from '../models/balance.sheet';

export class RegionProvider extends Provider<string, Region> {
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

  private static async fromFile(path: string) {
    const fileText = fs.readFileSync(path);
    const jsonParsed = JSON.parse(fileText.toString());
    const regions = RegionSchema.array().parse(jsonParsed);
    const regionProvider = new RegionProvider();
    for (const region of regions) {
      regionProvider.set(region.countryCode, region);
    }
    return regionProvider;
  }
}
