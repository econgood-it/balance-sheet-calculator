import Provider from './provider';

import fs from 'fs';

import path from 'path';
import { Industry, IndustrySchema } from '../models/industry';
import { BalanceSheetVersion } from '../models/balance.sheet';

export class IndustryProvider extends Provider<string, Industry> {
  public static async fromVersion(version: BalanceSheetVersion) {
    const regionPath = path.join(
      path.resolve(__dirname, '../files/providers'),
      'industries_5_0_4.json'
    );
    return IndustryProvider.fromFile(regionPath);
  }

  private static async fromFile(path: string) {
    const fileText = fs.readFileSync(path);
    const jsonParsed = JSON.parse(fileText.toString());
    const industries = IndustrySchema.array().parse(jsonParsed);
    const industryProvider = new IndustryProvider();
    for (const industry of industries) {
      industryProvider.set(industry.industryCode, industry);
    }
    return industryProvider;
  }
}
