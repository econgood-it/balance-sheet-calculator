import { StakeholderWeightCalculator } from "./StakeholderWeightCalculator";
import { Topic } from "../entities/topic";
import {Precalculations} from "./precalculator";

export class MaxPointsCalculator {
    private stakeholderWeightCalculator: StakeholderWeightCalculator = new StakeholderWeightCalculator();

    public async updateMaxPointsAndPoints(topics: Topic[], precalculations: Precalculations): Promise<void> {
        let sumOfTopicWeights = 0;
        // Compute sum of topic weights 
        for (const topic of topics) {
            const stakeholderName: string = topic.shortName.substring(0, 1);
            const stakeholderWeight: number = await this.stakeholderWeightCalculator.calcStakeholderWeight(stakeholderName,
              precalculations);
            sumOfTopicWeights += stakeholderWeight * topic.weight;
        }

        for (const topic of topics) {
            // Update max points of topic
            const stackholderName: string = topic.shortName.substring(0, 1);
            const stakeholderWeight: number = await this.stakeholderWeightCalculator.calcStakeholderWeight(stackholderName,
              precalculations);
            topic.maxPoints = stakeholderWeight * topic.weight / sumOfTopicWeights * 1000;
            this.updatePositiveAspects(topic);
            this.updateNegativeAspects(topic);
            topic.points = topic.aspects.reduce((sum, current) => sum + current.points, 0);
        }
    }

    private updateNegativeAspects(topic: Topic) {
        for (const aspect of topic.aspects.filter(t => t.isPositive == false)) {
            aspect.maxPoints = -200 * topic.maxPoints / 50;
            aspect.points = aspect.estimations * topic.maxPoints / 50;
        }
    }

    private updatePositiveAspects(topic: Topic) {
        let sumOfAspectWeights = 0;
        const positiveAspects = topic.aspects.filter(t => t.isPositive == true);
        for (const aspect of positiveAspects) {
            sumOfAspectWeights += aspect.weight;
        }
        for (const aspect of positiveAspects) {
            aspect.maxPoints = sumOfAspectWeights > 0 ? topic.maxPoints * aspect.weight / sumOfAspectWeights : 0;
            aspect.points = aspect.maxPoints * aspect.estimations / 10.0;
        }
    }
}