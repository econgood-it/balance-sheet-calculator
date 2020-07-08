import { StakeholderWeightCalculator } from "./StakeholderWeightCalculator";
import { Topic } from "../entities/topic";
import { CompanyFacts } from "../entities/companyFacts";
import RegionService from "../services/region.service";

export class MaxPointsCalculator {
    private stakeholderWeightCalculator: StakeholderWeightCalculator;
    constructor(private companyFacts: CompanyFacts, regionService: RegionService) {
        this.stakeholderWeightCalculator = new StakeholderWeightCalculator(companyFacts, regionService);
    }

    public async updateMaxPointsOfTopics(topics: Topic[]): Promise<void> {
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