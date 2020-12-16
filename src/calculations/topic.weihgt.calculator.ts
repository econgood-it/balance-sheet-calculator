import {CalcResults} from "./calculator";
import {IndustryProvider} from "../providers/industry.provider";
import {CompanyFacts} from "../entities/companyFacts";


export class TopicWeihgtCalculator {

    public async calcTopicWeight(topicShortName: string, calcResults: CalcResults, companyFacts: CompanyFacts): Promise<number> {
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
            case 'B1':
                weight = await this.calculateTopicWeightOfB1(calcResults);
                break;
            case 'B2':
                weight = await this.calculateTopicWeightOfB2(companyFacts.financialCosts);
                break;
            case 'B3':
                weight = await this.calculateTopicWeightOfB3(calcResults);
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
        if (calcResults.financeCalcResults.companyIsActiveInFinancialServices) {
            return 2;
        } else if (calcResults.financeCalcResults.economicRatio < 0.1) {
            return 1.5;
        } else if (calcResults.financeCalcResults.economicRatio > 0.5) {
            return 0.5;
        } else {
            return 1;
        }
    }

    public calculateTopicWeightOfB2(financialCosts: number): number {
        if (financialCosts == 0) {
            return 1;
        } else if (financialCosts > 0.1) {
            return 1.5
        } else if (financialCosts < 0.001) {
            return 0;
        } else if (financialCosts < 0.03) {
            return 0.5;
        } else {
            return 1;
        }

    }

    public calculateTopicWeightOfB3(calcResults: CalcResults): number {
        if (calcResults.financeCalcResults.companyIsActiveInFinancialServices) {
            return 2;
        } else if (calcResults.financeCalcResults.economicRatioE22 < 0.1) {
            return 0.5;
        } else if (calcResults.financeCalcResults.economicRatioE22 > 0.25) {
            return 1.5
        } else {
            return 1;
        }
    }
}