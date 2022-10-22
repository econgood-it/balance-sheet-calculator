import { RegionProvider } from '../providers/region.provider';
import { IndustryProvider } from '../providers/industry.provider';
import { CalcResults, Calculator } from '../calculations/calculator';
import { RatingsUpdater } from '../calculations/ratings.updater';
import { StakeholderWeightCalculator } from '../calculations/stakeholder.weight.calculator';
import { TopicWeightCalculator } from '../calculations/topic.weight.calculator';
import Provider from '../providers/provider';
import { BalanceSheet } from '../models/balance.sheet';

export class CalculationService {
  public static async calculate(balanceSheet: BalanceSheet): Promise<{
    updatedBalanceSheet: BalanceSheet;
    calcResults: CalcResults;
    stakeholderWeights: Provider<string, number>;
    topicWeights: Provider<string, number>;
  }> {
    const regionProvider = await RegionProvider.fromVersion(
      balanceSheet.version
    );
    const industryProvider = await IndustryProvider.fromVersion(
      balanceSheet.version
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
    const updatedBalanceSheet = await ratingsUpdater.update(
      balanceSheet,
      calcResults,
      stakeholderWeights,
      topicWeights
    );

    return {
      updatedBalanceSheet,
      calcResults,
      stakeholderWeights,
      topicWeights,
    };
  }
}
