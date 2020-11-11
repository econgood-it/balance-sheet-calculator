import {Precalculations} from "./precalculator";


export class StakeholderWeightCalculator {

    private readonly defaultPPPIndex = 0.978035862587365;
    private readonly defaultIfDenominatorIsZero = 100.;

    public async calcStakeholderWeight(stakeholderName: string, precalculations: Precalculations): Promise<number> {

        let weight: number = 1;
        switch (stakeholderName) {
            case 'A':
                weight = await this.calculateSupplierWeightFromCompanyFacts(precalculations);
                break;
            case 'B':
                weight = await this.calculateFinancialWeightFromCompanyFacts(precalculations);
                break;
            case 'C':
                weight = await this.calculateEmployeeWeightFromCompanyFacts(precalculations);
                break;
            case 'D':
                weight = await this.calculateCustomerWeightFromCompanyFacts();
                break;
            case 'E':
                weight = await this.calculateSocialEnvironmentlWeightFromCompanyFacts();
                break;
            default:
                weight = 1;
                break;
        }
        return weight;

    }

    // A
    public async calculateSupplierWeightFromCompanyFacts(precalculations: Precalculations): Promise<number> {
        const supplierAndEmployeesRiskRation = await this.calculateSupplierAndEmployeesRiskRatio(precalculations);
        return this.mapToWeight(this.mapToValueBetween60And300(supplierAndEmployeesRiskRation));
    }

    // B
    public async calculateFinancialWeightFromCompanyFacts(precalculations: Precalculations): Promise<number> {
        const financialRisk = await this.calculateFinancialRisk(precalculations);
        return this.mapToWeight(this.mapToValueBetween60And300(financialRisk));
    }

    // C
    public async calculateEmployeeWeightFromCompanyFacts(precalculations: Precalculations): Promise<number> {
        const employeesRisk = await this.calculateEmployeesRisk(precalculations);
        return this.mapToWeight(this.mapToValueBetween60And300(employeesRisk));
    }

    // D
    public async calculateCustomerWeightFromCompanyFacts(): Promise<number> {
        return 1.0;
    }

    // E
    public async calculateSocialEnvironmentlWeightFromCompanyFacts(): Promise<number> {
        return 1.0;
    }

    public mapToWeight(normedSupplierAndEmployeesRiskRatio: number) {
        if (normedSupplierAndEmployeesRiskRatio === 60) {
            return 0.5;
        } else if (normedSupplierAndEmployeesRiskRatio === 300) {
            return 2;
        } else if (normedSupplierAndEmployeesRiskRatio < 180) {
            return 1;
        } else {
            return 1.5;
        }
    }

    public mapToValueBetween60And300(supplierAndEmployeesRiskRatio: number): number {
        return supplierAndEmployeesRiskRatio < 60 ? 60
            : supplierAndEmployeesRiskRatio > 300 ? 300 : supplierAndEmployeesRiskRatio;
    }

    // =WENNFEHLER((60*$'11.Region'.G3/($'11.Region'.G3+$'11.Region'.G10+(I19+I21+I22+G24))*5),100)
    public async calculateSupplierAndEmployeesRiskRatio(precalculations: Precalculations): Promise<number> {
        // (60*$'11.Region'.G3)
        const numerator = 60 * precalculations.supplyRiskSum;
        // ($'11.Region'.G3+$'11.Region'.G10+(I19+I21+I22+G24))
        const denominator: number = precalculations.supplyRiskSum + precalculations.normedEmployeesRisk +
          precalculations.sumOfFinancialAspects;
        // (60*$'11.Region'.G3/($'11.Region'.G3+$'11.Region'.G10+(I19+I21+I22+G24))*5))
        return denominator != 0 ? numerator / denominator * 5 : this.defaultIfDenominatorIsZero;
    }

    // =WENNFEHLER((60*(I19+I21+I22+G24)/($'11.Region'.G3+$'11.Region'.G10+(I19+I21+I22+G24))*10);100)
    public async calculateFinancialRisk(precalculations: Precalculations): Promise<number> {
        const numerator = 60 * precalculations.sumOfFinancialAspects;
        const denominator: number = precalculations.supplyRiskSum + precalculations.normedEmployeesRisk +
          precalculations.sumOfFinancialAspects;
        return denominator != 0 ? numerator / denominator * 10 : this.defaultIfDenominatorIsZero;
    }

    // =WENNFEHLER((60*$'11.Region'.G10/($'11.Region'.G3+$'11.Region'.G10+(I19+I21+I22+G24))*10);100)
    public async calculateEmployeesRisk(precalculations: Precalculations): Promise<number> {
        const numerator = 60 * precalculations.normedEmployeesRisk;
        const denominator: number = precalculations.supplyRiskSum + precalculations.normedEmployeesRisk +
          precalculations.sumOfFinancialAspects;
        return denominator != 0 ? numerator / denominator * 10 : this.defaultIfDenominatorIsZero;
    }
}