import { StakeholderWeightCalculator } from './stakeholder.weight.calculator';
import { CalcResults } from './calculator';
import { TopicWeightCalculator } from './topic.weight.calculator';
import { BalanceSheet } from '../entities/balanceSheet';
import { Rating } from '../entities/rating';

export class RatingsUpdater {
  private stakeholderWeightCalculator: StakeholderWeightCalculator =
    new StakeholderWeightCalculator();

  private topicWeightCalculator: TopicWeightCalculator =
    new TopicWeightCalculator();

  public async update(
    balanceSheet: BalanceSheet,
    calcResults: CalcResults
  ): Promise<BalanceSheet> {
    let sumOfTopicWeights = 0;
    // Compute sum of topic weights
    const topics = balanceSheet.getTopics();
    const ratings: Rating[] = [];
    for (const topic of topics) {
      const stakeholderName: string = topic.shortName.substring(0, 1);
      const stakeholderWeight: number =
        await this.stakeholderWeightCalculator.calcStakeholderWeight(
          stakeholderName,
          calcResults
        );
      topic.weight = topic.isWeightSelectedByUser
        ? topic.weight
        : await this.topicWeightCalculator.calcTopicWeight(
            topic.shortName,
            calcResults,
            balanceSheet.companyFacts
          );
      sumOfTopicWeights += stakeholderWeight * topic.weight;
    }

    for (const topic of topics) {
      // Update max points of topic
      const stackholderName: string = topic.shortName.substring(0, 1);
      const stakeholderWeight: number =
        await this.stakeholderWeightCalculator.calcStakeholderWeight(
          stackholderName,
          calcResults
        );
      topic.maxPoints =
        ((stakeholderWeight * topic.weight) / sumOfTopicWeights) * 1000;
      const aspects = balanceSheet.getAspectsOfTopic(topic.shortName);
      const updatedAspects = [
        ...this.updatePositiveAspects(topic, aspects),
        ...this.updateNegativeAspects(topic, aspects),
      ];
      topic.points = updatedAspects.reduce(
        (sum, current) => sum + current.points,
        0
      );
      ratings.push(topic, ...updatedAspects);
    }
    return new BalanceSheet(
      balanceSheet.id,
      balanceSheet.type,
      balanceSheet.version,
      balanceSheet.companyFacts,
      ratings,
      balanceSheet.users
    );
  }

  private updateNegativeAspects(topic: Rating, aspects: Rating[]): Rating[] {
    return aspects
      .filter((r) => r.isPositive === false)
      .map((a) => {
        return new Rating(
          a.id,
          a.shortName,
          a.name,
          a.estimations,
          (a.estimations * topic.maxPoints) / 50,
          (-200 * topic.maxPoints) / 50,
          a.weight,
          a.isWeightSelectedByUser,
          a.isPositive
        );
      });
  }

  private updatePositiveAspects(topic: Rating, aspects: Rating[]): Rating[] {
    let sumOfAspectWeights = 0;
    const positiveAspects = aspects.filter((t) => t.isPositive === true);
    for (const aspect of positiveAspects) {
      sumOfAspectWeights += aspect.weight;
    }
    return positiveAspects.map((a) => {
      const maxPoints =
        sumOfAspectWeights > 0
          ? (topic.maxPoints * a.weight) / sumOfAspectWeights
          : 0;
      return new Rating(
        a.id,
        a.shortName,
        a.name,
        a.estimations,
        (maxPoints * a.estimations) / 10.0,
        maxPoints,
        a.weight,
        a.isWeightSelectedByUser,
        a.isPositive
      );
    });
  }
}
