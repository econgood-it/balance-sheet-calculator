import { StakeholderWeightCalculator } from './stakeholder.weight.calculator';
import { Topic } from '../entities/topic';
import { CalcResults } from './calculator';
import { TopicWeightCalculator } from './topic.weight.calculator';
import { CompanyFacts } from '../entities/companyFacts';

export class TopicUpdater {
  private stakeholderWeightCalculator: StakeholderWeightCalculator =
    new StakeholderWeightCalculator();

  private topicWeightCalculator: TopicWeightCalculator =
    new TopicWeightCalculator();

  public async update(
    topics: Topic[],
    companyFacts: CompanyFacts,
    calcResults: CalcResults
  ): Promise<void> {
    let sumOfTopicWeights = 0;
    // Compute sum of topic weights
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
            companyFacts
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
      this.updatePositiveAspects(topic);
      this.updateNegativeAspects(topic);
      topic.points = topic.aspects.reduce(
        (sum, current) => sum + current.points,
        0
      );
    }
  }

  private updateNegativeAspects(topic: Topic) {
    for (const aspect of topic.aspects.filter((t) => t.isPositive === false)) {
      aspect.maxPoints = (-200 * topic.maxPoints) / 50;
      aspect.points = (aspect.estimations * topic.maxPoints) / 50;
    }
  }

  private updatePositiveAspects(topic: Topic) {
    let sumOfAspectWeights = 0;
    const positiveAspects = topic.aspects.filter((t) => t.isPositive === true);
    for (const aspect of positiveAspects) {
      sumOfAspectWeights += aspect.weight;
    }
    for (const aspect of positiveAspects) {
      aspect.maxPoints =
        sumOfAspectWeights > 0
          ? (topic.maxPoints * aspect.weight) / sumOfAspectWeights
          : 0;
      aspect.points = (aspect.maxPoints * aspect.estimations) / 10.0;
    }
  }
}
