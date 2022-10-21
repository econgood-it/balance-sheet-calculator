import Provider from './provider';
import { Industry } from '../entities/industry';
import fs from 'fs';
import { BalanceSheetVersion } from '../entities/enums';
import { z } from 'zod';
import path from 'path';

const IndustrySchema = z.object({
  ecologicalSupplyChainRisk: z.number(),
  ecologicalDesignOfProductsAndServices: z.number(),
  industryCode: z.string(),
  name: z.string(),
});

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
      industryProvider.set(
        industry.industryCode,
        new Industry(
          undefined,
          industry.industryCode,
          industry.name,
          industry.ecologicalSupplyChainRisk,
          industry.ecologicalDesignOfProductsAndServices
        )
      );
    }
    return industryProvider;
  }
}
