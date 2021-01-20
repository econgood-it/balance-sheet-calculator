import {CalcResults} from "./calculator";
import {CompanyFacts} from "../entities/companyFacts";
import {CompanySize} from "./employees.calc";


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
            case 'B4':
                weight = await this.calculateTopicWeightOfB4(calcResults);
                break;
            case 'C1':
                weight = this.constantWeight();
                break;
            case 'C2':
                weight = this.constantWeight();
                break;
            case 'C3':
                weight = this.calculateTopicWeightOfC3(companyFacts);
                break;
            case 'C4':
                weight = this.calculateTopicWeightOfC4(calcResults, companyFacts);
                break;
            case 'D1':
                weight = this.constantWeight();
                break;
            case 'D2':
                weight = this.constantWeight();
                break;
            case 'D3':
                weight = this.calculateTopicWeightOfD3(calcResults);
                break;
            case 'D4':
                weight = this.calculateTopicWeightOfD4(companyFacts);
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

    public calculateTopicWeightOfB4(calcResults: CalcResults): number {
        if (calcResults.employeesCalcResults.companySize === CompanySize.micro) {
            return 0.5;
        } else {
            return 1;
        }
    }

    public calculateTopicWeightOfC3(companyFacts: CompanyFacts): number {
        if (companyFacts.averageJourneyToWorkForStaffInKm < 10 && !companyFacts.hasCanteen) {
            return 0.5;
        } else if (companyFacts.averageJourneyToWorkForStaffInKm > 25) {
            return 1.5;
        } else {
            return 1;
        }
    }

    public calculateTopicWeightOfC4(calcResults: CalcResults, companyFacts: CompanyFacts): number {
        if (companyFacts.numberOfEmployees === 1) {
            return 0;
        }
        else if (calcResults.employeesCalcResults.companySize == CompanySize.micro) {
            return 0.5;
        }
        else if (calcResults.employeesCalcResults.itucAverage > 3.25) {
            return 1.5;
        } else {
            return 1;
        }
    }

    public calculateTopicWeightOfD3(calcResults: CalcResults): number {
        if (calcResults.customerCalcResults.sumOfEcologicalDesignOfProductsAndService < 0.75) {
            return 0.5;
        }
        else if (calcResults.customerCalcResults.sumOfEcologicalDesignOfProductsAndService < 1.25) {
            return 1;
        } else if (calcResults.customerCalcResults.sumOfEcologicalDesignOfProductsAndService > 1.75) {
            return 2;
        } else {
            return 1.5;
        }
    }

    public calculateTopicWeightOfD4(companyFacts: CompanyFacts): number {
        return companyFacts.isB2B ? 1.5 : 1;
    }
}