import { BalanceSheet } from '../entities/balanceSheet';
import { EntityManager } from 'typeorm';
import { Industry } from '../entities/industry';
import { RegionProvider } from '../providers/region.provider';
import { Region } from '../entities/region';
import { IndustryProvider } from '../providers/industry.provider';
import { CalcResults, Calculator } from '../calculations/calculator';
import { TopicUpdater } from '../calculations/topic.updater';
import { SortService } from './sort.service';

export class CalculationService {
  public static async calculate(
    balanceSheet: BalanceSheet,
    entityManager: EntityManager,
    saveCalcResults: boolean
  ): Promise<BalanceSheet> {
    const industryRepository = entityManager.getRepository(Industry);
    const regionProvider = await RegionProvider.createFromCompanyFacts(
      balanceSheet.companyFacts,
      entityManager.getRepository(Region)
    );
    const industryProvider = await IndustryProvider.createFromCompanyFacts(
      balanceSheet.companyFacts,
      industryRepository
    );
    const calcResults: CalcResults = await new Calculator(
      regionProvider,
      industryProvider
    ).calculate(balanceSheet.companyFacts);
    const topicUpdater: TopicUpdater = new TopicUpdater();
    await topicUpdater.update(
      balanceSheet.rating.topics,
      balanceSheet.companyFacts,
      calcResults
    );
    if (saveCalcResults) {
      balanceSheet = await entityManager
        .getRepository(BalanceSheet)
        .save(balanceSheet);
    }
    SortService.sortArraysOfBalanceSheet(balanceSheet);
    return balanceSheet;
  }
}
