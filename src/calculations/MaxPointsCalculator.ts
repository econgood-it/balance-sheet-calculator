import { StakeholderWeightCalculator } from "./StakeholderWeightCalculator";
import { Topic } from "../entities/topic";
import { CompanyFacts } from "../entities/companyFacts";

export class MaxPointsCalculator {
    private stakeholderWeightCalculator: StakeholderWeightCalculator;
    constructor(private companyFacts: CompanyFacts) {
        this.stakeholderWeightCalculator = new StakeholderWeightCalculator(companyFacts);
    }

    public updateMaxPointsOfTopics(topics: Topic[]): void {
        let sumOfWeights = 0;
        for (const topic of topics) {
            const stackholderName: string = topic.shortName.substring(0, 1);
            const stakeholderWeight: number = this.stakeholderWeightCalculator.calcStakeholderWeight(stackholderName);
            sumOfWeights += stakeholderWeight * topic.weight;
        }

        for (const topic of topics) {
            const stackholderName: string = topic.shortName.substring(0, 1);
            const stakeholderWeight: number = this.stakeholderWeightCalculator.calcStakeholderWeight(stackholderName);
            topic.maxPoints = stakeholderWeight * topic.weight / sumOfWeights * 1000;
            topic.points = topic.maxPoints * topic.estimations / 10.0;
        }
    }
}