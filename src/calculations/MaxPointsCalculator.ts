import { StakeholderWeightCalculator } from "./StakeholderWeightCalculator";
import { Topic } from "../entities/topic";
import { CompanyFacts } from "../entities/companyFacts";
import { Repository } from "typeorm";
import { Region } from "../entities/region";

export class MaxPointsCalculator {
    private stakeholderWeightCalculator: StakeholderWeightCalculator;
    constructor(companyFacts: CompanyFacts, regionRepository: Repository<Region>) {
        this.stakeholderWeightCalculator = new StakeholderWeightCalculator(companyFacts, regionRepository);
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