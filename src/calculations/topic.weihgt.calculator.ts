import {CalcResults} from "./calculator";
import {IndustryProvider} from "../providers/industry.provider";


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
            case 'A4':
                weight = await this.calculateTopicWeightOfA4(calcResults);
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
        if (calcResults.supplyCalcResults.supplyChainWeight > 1.5) {
            return 2;
        } else if (calcResults.supplyCalcResults.supplyChainWeight > 1.25) {
            return 1.5;
        } else if (calcResults.supplyCalcResults.supplyChainWeight < 0.75) {
            return 0.5;
        } else {
            return 1;
        }
    }

    public calculateTopicWeightOfA4(calcResults: CalcResults): number {
        if (calcResults.supplyCalcResults.itucAverage < 1.5) {
            return 0.5;
        } else if (calcResults.supplyCalcResults.itucAverage < 3.26) {
            return 1;
        } else if (calcResults.supplyCalcResults.itucAverage < 4.5) {
            return 1.5;
        } else {
            return 2;
        }
    }

    public calculateTopicWeightOfB1(calcResults: CalcResults): number {

        if (calcResults.supplyCalcResults.itucAverage < 1.5) {
            return 0.5;
        } else if (calcResults.supplyCalcResults.itucAverage < 3.26) {
            return 1;
        } else if (calcResults.supplyCalcResults.itucAverage < 4.5) {
            return 1.5;
        } else {
            return 2;
        }
    }
}