import { RegionProvider } from '../providers/region.provider';
import { IndustryProvider } from '../providers/industry.provider';
import { CalcResults, Calculator } from '../calculations/calculator';
import { RatingsUpdater } from '../calculations/ratings.updater';
import { StakeholderWeightCalculator } from '../calculations/stakeholder.weight.calculator';
import { TopicWeightCalculator } from '../calculations/topic.weight.calculator';
import Provider from '../providers/provider';
import { BalanceSheet } from '../models/balance.sheet';
import { BalanceSheetEntity } from '../entities/balance.sheet.entity';

export namespace Calc {
  export async function calculate(
    balanceSheetEntity: BalanceSheetEntity
  ): Promise<{
    updatedBalanceSheet: BalanceSheet;
    calcResults: CalcResults;
    stakeholderWeights: Provider<string, number>;
    topicWeights: Provider<string, number>;
  }> {
    const regionProvider = await RegionProvider.fromVersion(
      balanceSheetEntity.getVersion()
    );
    const industryProvider = await IndustryProvider.fromVersion(
      balanceSheetEntity.getVersion()
    );
    const calcResults: CalcResults = await new Calculator(
      regionProvider,
      industryProvider
    ).calculate(balanceSheetEntity.companyFacts);
    const ratingsUpdater: RatingsUpdater = new RatingsUpdater();
    const stakeholderWeightCalculator = new StakeholderWeightCalculator();
    const topicWeightCalculator = new TopicWeightCalculator();
    const stakeholderWeights =
      await stakeholderWeightCalculator.calcStakeholderWeights(calcResults);
    const topicWeights = topicWeightCalculator.calcTopicWeights(
      calcResults,
      balanceSheetEntity.companyFacts
    );
    const updatedBalanceSheet = await ratingsUpdater.update(
      balanceSheetEntity,
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
