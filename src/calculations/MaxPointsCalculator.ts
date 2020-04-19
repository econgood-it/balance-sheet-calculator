import {ICompanyFacts} from "../models/companyFacts.model";
import {ITopic} from "../models/topic.model";
import {StakeholderWeightCalculator} from "./StakeholderWeightCalculator";

export class MaxPointsCalculator {
    private stakeholderWeightCalculator: StakeholderWeightCalculator;
    constructor(private companyFacts: ICompanyFacts) {
        this.stakeholderWeightCalculator = new StakeholderWeightCalculator(companyFacts);
    }

    public async updateMaxPointsOfTopics(topics: ITopic[]): Promise<void> {
        let sumOfWeights = 0;
        for (const topic of topics) {
            const stackholderName: string = topic.shortName.substring(0, 1);
            const stakeholderWeight: number = await this.stakeholderWeightCalculator.calcStakeholderWeight(stackholderName);
            sumOfWeights += stakeholderWeight * topic.weight;
        }

        for (const topic of topics) {
            const stackholderName: string = topic.shortName.substring(0, 1);
            const stakeholderWeight: number = await this.stakeholderWeightCalculator.calcStakeholderWeight(stackholderName);
            topic.maxPoints = stakeholderWeight * topic.weight / sumOfWeights * 1000;
            topic.points = topic.maxPoints * topic.estimations / 10.0;
        }
    }
}