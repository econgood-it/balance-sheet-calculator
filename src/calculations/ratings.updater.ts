import { CalcResults } from './calculator';
import Provider from '../providers/provider';
import { BalanceSheet } from '../models/balance.sheet';
import { filterAspectsOfTopic, filterTopics, Rating } from '../models/rating';

export class RatingsUpdater {
  public async update(
    balanceSheet: BalanceSheet,
    calcResults: CalcResults,
    stakeholderWeights: Provider<string, number>,
    topicWeights: Provider<string, number>
  ): Promise<BalanceSheet> {
    // Compute sum of topic weights
    const topics = filterTopics(balanceSheet.ratings);
    const topicsWithUpdatedWeight = topics.map((t) =>
      // TODO: Debug topic weights further:
      // Topic wheigt is set to 1 if data of company facts is empty.
      // See Weighting G69
      ({
        ...t,
        weight: t.isWeightSelectedByUser
          ? t.weight
          : topicWeights.getOrFail(t.shortName),
      })
    );

    const sumOfTopicWeights = topicsWithUpdatedWeight.reduce(
      (acc, curr) =>
        acc +
        stakeholderWeights.getOrFail(curr.shortName.substring(0, 1)) *
          curr.weight,
      0
    );

    const updatedRatings: Rating[] = [];

    for (const t of topicsWithUpdatedWeight) {
      const stakeholderName = t.shortName.substring(0, 1);
      const stakeholderWeight = stakeholderWeights.getOrFail(stakeholderName);
      const topicMaxPoints =
        ((stakeholderWeight * t.weight) / sumOfTopicWeights) * 1000;
      const aspects = filterAspectsOfTopic(balanceSheet.ratings, t.shortName);
      const updatedAspects = [
        ...this.updatedPositiveAspects(topicMaxPoints, aspects),
        ...this.updatedNegativeAspects(topicMaxPoints, aspects),
      ];
      const topicPoints = updatedAspects.reduce(
        (sum, current) => sum + current.points,
        0
      );
      const estimations = topicMaxPoints > 0 ? topicPoints / topicMaxPoints : 0;
      updatedRatings.push(
        {
          ...t,
          points: topicPoints,
          maxPoints: topicMaxPoints,
          estimations,
        },
        ...updatedAspects
      );
    }

    return { ...balanceSheet, ratings: updatedRatings };
  }

  private updatedPositiveAspects(
    topicMaxPoints: number,
    aspects: Rating[]
  ): Rating[] {
    const positiveAspects = aspects.filter((t) => t.isPositive === true);
    const sumOfAspectWeights = positiveAspects.reduce(
      (acc, curr) => acc + curr.weight,
      0
    );
    return positiveAspects.map((a) => {
      const maxPoints =
        sumOfAspectWeights > 0
          ? (topicMaxPoints * a.weight) / sumOfAspectWeights
          : 0;
      return {
        ...a,
        maxPoints,
        points: (maxPoints * a.estimations) / 10.0,
      };
    });
  }

  private updatedNegativeAspects(
    topicMaxPoints: number,
    aspects: Rating[]
  ): Rating[] {
    return aspects
      .filter((r) => r.isPositive === false)
      .map((a) => ({
        ...a,
        points: (a.estimations * topicMaxPoints) / 50,
        maxPoints: (-200 * topicMaxPoints) / 50,
      }));
  }
}
