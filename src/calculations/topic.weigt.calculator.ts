import {CalcResults} from "./calculator";


export class TopicWeigtCalculator {

    public async calcTopicWeight(topicShortName: string, precalculations: CalcResults): Promise<number> {
        let weight: number = 1;
        switch (topicShortName) {
            case 'A1':
                weight = await this.constantWeight();
                break;
            case 'A2':
                weight = await this.constantWeight();
                break;
            case 'A3':
                weight = await this.calculateTopicWeightOfA3(precalculations);
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

    public calculateTopicWeightOfA3(precalculations: CalcResults): number {
        throw new Error();
    }
}