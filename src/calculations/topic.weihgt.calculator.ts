import {CalcResults} from "./calculator";


export class TopicWeigtCalculator {

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
        throw new Error();
    }
}