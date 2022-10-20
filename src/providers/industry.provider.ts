import Provider from './provider';
import { Industry } from '../entities/industry';
import { Repository } from 'typeorm';
import { CompanyFacts } from '../entities/companyFacts';
import fs from 'fs';
import { Region } from '../entities/region';
import { BalanceSheetVersion } from '../entities/enums';
import { z } from 'zod';

const IndustrySchema = z.object({
  ecologicalSupplyChainRisk: z.number(),
  ecologicalDesignOfProductsAndServices: z.number(),
  industryCode: z.string(),
  name: z.string(),
});

export class IndustryProvider extends Provider<string, Industry> {
  public static async fromFile(path: string) {
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

  public static createFromCompanyFacts = async (
    companyFacts: CompanyFacts,
    industryRepository: Repository<Industry>
  ) => {
    const industryProvider = new Provider<string, Industry>();
    for (const supplyFraction of companyFacts.supplyFractions) {
      industryProvider.set(
        supplyFraction.industryCode,
        await industryRepository.findOneOrFail({
          where: {
            industryCode: supplyFraction.industryCode,
          },
        })
      );
    }
    for (const industrySector of companyFacts.industrySectors) {
      industryProvider.set(
        industrySector.industryCode,
        await industryRepository.findOneOrFail({
          where: {
            industryCode: industrySector.industryCode,
          },
        })
      );
    }
    return industryProvider;
  };
}
