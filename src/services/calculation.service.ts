import { BalanceSheet } from '../entities/balanceSheet';
import { EntityManager } from 'typeorm';
import { Industry } from '../entities/industry';
import { RegionProvider } from '../providers/region.provider';
import { Region } from '../entities/region';
import { IndustryProvider } from '../providers/industry.provider';
import { CalcResults, Calculator } from '../calculations/calculator';
import { RatingsUpdater } from '../calculations/ratings.updater';

export class CalculationService {
  public static async calculate(
    balanceSheet: BalanceSheet,
    entityManager: EntityManager,
    saveCalcResults: boolean
  ): Promise<BalanceSheet> {
    const industryRepository = entityManager.getRepository(Industry);
    const regionProvider = await RegionProvider.createFromCompanyFacts(
      balanceSheet.companyFacts,
      entityManager.getRepository(Region),
      balanceSheet.version
    );
    const industryProvider = await IndustryProvider.createFromCompanyFacts(
      balanceSheet.companyFacts,
      industryRepository
    );
    const calcResults: CalcResults = await new Calculator(
      regionProvider,
      industryProvider
    ).calculate(balanceSheet.companyFacts);
    const ratingsUpdater: RatingsUpdater = new RatingsUpdater();
    let updatedBalanceSheet = await ratingsUpdater.update(
      balanceSheet,
      calcResults
    );
    if (saveCalcResults) {
      updatedBalanceSheet = await entityManager
        .getRepository(BalanceSheet)
        .save(updatedBalanceSheet);
    }
    updatedBalanceSheet.sortRatings();
    return updatedBalanceSheet;
  }
}
