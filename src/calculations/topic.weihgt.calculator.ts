import {CalcResults} from "./calculator";


export class TopicWeihgtCalculator {

    public async calcTopicWeight(topicShortName: string, calcResults: CalcResults): Promise<number> {
        let weight: number = 1;
        switch (topicShortName) {
            case 'A1':
                weight = await this.constantWeight();
                break;
            case 'A2':
                weight = await this.constantWeight();
                break;
            case 'A3':
                weight = await this.calculateTopicWeightOfA3(calcResults);
                break;
            default:
                weight = 1;
                break;
        }
        return weight;
    }

    public constantWeight(): number {
        return 1.0;
    }

    public calculateTopicWeightOfA3(calcResults: CalcResults): number {
        if (calcResults.supplyChainWeight > 1.5) {
            return 2;
        } else if (calcResults.supplyChainWeight > 1.25) {
            return 1.5;
        } else if (calcResults.supplyChainWeight < 0.75) {
            return 0.5;
        } else {
            return 1;
        }
    }
}