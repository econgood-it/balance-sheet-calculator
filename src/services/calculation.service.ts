import { BalanceSheet } from '../entities/balanceSheet';
import { EntityManager } from 'typeorm';
import { Industry } from '../entities/industry';
import { RegionProvider } from '../providers/region.provider';
import { Region } from '../entities/region';
import { IndustryProvider } from '../providers/industry.provider';
import { CalcResults, Calculator } from '../calculations/calculator';
import { RatingsUpdater } from '../calculations/ratings.updater';
import { StakeholderWeightCalculator } from '../calculations/stakeholder.weight.calculator';
import { TopicWeightCalculator } from '../calculations/topic.weight.calculator';
import Provider from '../providers/provider';

export class CalculationService {
  public static async calculate(
    balanceSheet: BalanceSheet,
    entityManager: EntityManager,
    saveCalcResults: boolean
  ): Promise<{
    updatedBalanceSheet: BalanceSheet;
    calcResults: CalcResults;
    stakeholderWeights: Provider<string, number>;
    topicWeights: Provider<string, number>;
  }> {
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
    const stakeholderWeightCalculator = new StakeholderWeightCalculator();
    const topicWeightCalculator = new TopicWeightCalculator();
    const stakeholderWeights =
      await stakeholderWeightCalculator.calcStakeholderWeights(calcResults);
    const topicWeights = topicWeightCalculator.calcTopicWeights(
      calcResults,
      balanceSheet.companyFacts
    );
    let updatedBalanceSheet = await ratingsUpdater.update(
      balanceSheet,
      calcResults,
      stakeholderWeights,
      topicWeights
    );
    if (saveCalcResults) {
      updatedBalanceSheet = await entityManager
        .getRepository(BalanceSheet)
        .save(updatedBalanceSheet);
    }
    updatedBalanceSheet.sortRatings();
    return {
      updatedBalanceSheet: updatedBalanceSheet,
      calcResults: calcResults,
      stakeholderWeights: stakeholderWeights,
      topicWeights: topicWeights,
    };
  }
}
