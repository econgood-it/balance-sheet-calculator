import { StakeholderWeightCalculator } from "./StakeholderWeightCalculator";
import { Topic } from "../entities/topic";
import { CompanyFacts } from "../entities/companyFacts";
import { Repository } from "typeorm";
import { Region } from "../entities/region";
import { BalanceSheetType } from "../entities/enums";

export class MaxPointsCalculator {
    private stakeholderWeightCalculator: StakeholderWeightCalculator;
    constructor(companyFacts: CompanyFacts, regionRepository: Repository<Region>) {
        this.stakeholderWeightCalculator = new StakeholderWeightCalculator(companyFacts, regionRepository);
    }

    public async updateMaxPointsAndPoints(topics: Topic[], balanceSheetType: BalanceSheetType): Promise<void> {
        let sumOfTopicWeights = 0;
        // Compute sum of topic weights 
        for (const topic of topics) {
            const stackholderName: string = topic.shortName.substring(0, 1);
            const stakeholderWeight: number = await this.stakeholderWeightCalculator.calcStakeholderWeight(stackholderName);
            sumOfTopicWeights += stakeholderWeight * topic.weight;
        }

        for (const topic of topics) {
            // Update max points of topic
            const stackholderName: string = topic.shortName.substring(0, 1);
            const stakeholderWeight: number = await this.stakeholderWeightCalculator.calcStakeholderWeight(stackholderName);
            topic.maxPoints = stakeholderWeight * topic.weight / sumOfTopicWeights * 1000;
            let topicPoints;
            if (balanceSheetType === BalanceSheetType.Full) {
                this.updatePositiveAspects(topic);
                topicPoints = topic.positiveAspects.reduce((sum, current) => sum + current.points, 0);
            } else {
                topicPoints = topic.maxPoints * topic.estimations / 10.0
            }
            this.updateNegativeAspects(topic);
            topic.points = topicPoints + topic.negativeAspects.reduce((sum, current) => sum + current.points, 0);
        }
    }

    private updateNegativeAspects(topic: Topic) {
        for (const aspect of topic.negativeAspects) {
            aspect.maxPoints = -200 * topic.maxPoints / 50;
            aspect.points = aspect.estimations * topic.maxPoints / 50;
        }
    }

    private updatePositiveAspects(topic: Topic) {
        let sumOfAspectWeights = 0;
        for (const aspect of topic.positiveAspects) {
            sumOfAspectWeights += aspect.weight;
        }
        for (const aspect of topic.positiveAspects) {
            aspect.maxPoints = sumOfAspectWeights > 0 ? topic.maxPoints * aspect.weight / sumOfAspectWeights : 0;
            aspect.points = aspect.maxPoints * aspect.estimations / 10.0;
        }
    }
}