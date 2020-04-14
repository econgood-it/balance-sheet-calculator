import {ICompanyFacts} from "../models/companyFacts.model";
import Region, {IRegion} from "../models/region.model";
import {IEmployeesFrations} from "../models/employeesFractions.model";

export class StakeholderWeightCalculator {

    private readonly defaultPPPIndex = 0.978035862587365;

    constructor(private companyFacts: ICompanyFacts) {
    }

    public calcStakeholderWeight(stakeholderName: string): number {
        switch (stakeholderName) {
            case 'A':
                console.log("It is a Sunday.");
                break;
            case 'B':
                console.log("It is a Monday.");
                break;
            case 'C':
                console.log("It is a Tuesday.");
                break;
            case 'D':
                console.log("It is a Wednesday.");
                break;
            case 'E':
                console.log("It is a Thursday.");
                break;
            default:
                console.log("No such day exists!");
                break;
        }
        return 4;
    }

    // =WENNFEHLER((60*$'11.Region'.G10/($'11.Region'.G3+$'11.Region'.G10+(I19+I21+I22+G24))*10);100)
    public async calculateEmployeesRisk(): Promise<number> {
        const supplierRisks: number = await this.supplyRisks();
        const employeesRisksNormed: number = await this.calculateNormedEmployeesRisk();
        const sumOfFinances: number = this.getSumOfFinancialAspects();
        const numerator = 60 * employeesRisksNormed;
        const denominator: number = supplierRisks + employeesRisksNormed + sumOfFinances;
        return numerator / denominator * 10;
    }

    // =WENNFEHLER((60*(I19+I21+I22+G24)/($'11.Region'.G3+$'11.Region'.G10+(I19+I21+I22+G24))*10);100)
    public async calculateFinancialRisk(): Promise<number> {
        const supplierRisks: number = await this.supplyRisks();
        const employeesRisksNormed: number = await this.calculateNormedEmployeesRisk();
        const sumOfFinances: number = this.getSumOfFinancialAspects();
        const numerator = 60 * sumOfFinances;
        const denominator: number = supplierRisks + employeesRisksNormed + sumOfFinances;
        return numerator / denominator * 10;
    }

    public async calculateSupplierAndEmployeesRiskRatio(): Promise<number> {
        // In excel this is equal to the cell $'11.Region'.G3
        const supplierRisks: number = await this.supplyRisks();
        const employeesRisksNormed: number = await this.calculateNormedEmployeesRisk();

        const numerator = 60 * supplierRisks;
        // (60*$'11.Region'.G3/($'11.Region'.G3+$'11.Region'.G10+(I19+I21+I22+G24))*5))
        const  denominator: number = supplierRisks + employeesRisksNormed + this.getSumOfFinancialAspects();
        return numerator / denominator * 5;
    }

    // In excel this is equal to the cell $'11.Region'.G10
    public async calculateNormedEmployeesRisk(): Promise<number> {
        const employeesRisks: number = await this.employeesRisks();
        const employeesRisksNormalizer: number = this.employeesRisksNormalizer();
        // In excel this is equal to the cell $'11.Region'.G10
        return employeesRisks + employeesRisksNormalizer;
    }

    // In Excel I19+I21+I22+G24
    public getSumOfFinancialAspects(): number {
        return this.companyFacts.profit + this.companyFacts.financialCosts
            + this.companyFacts.incomeFromFinancialInvestments + this.companyFacts.additionsToFixedAssets;
    }

    private employeesRisksNormalizer(): number{
        const sumEmployeesPercentage: number = this.companyFacts.employeesFractions.reduce(
            (sum: number, ef) => sum + ef.percentage, 0)
        return (1 - sumEmployeesPercentage) * 0.978035862587365 * this.companyFacts.totalStaffCosts;
    }

    private async supplyRisks(): Promise<number> {
        let result: number = 0;
        for (const supplyFraction of this.companyFacts.supplyFractions) {
            const region: IRegion | null = await Region.findOne({countryCode: supplyFraction.countryCode})
            const pppIndex = region !== null ? region.pppIndex : this.defaultPPPIndex;
            result += supplyFraction.costs * pppIndex;
        }
        return result;
    }

    private async employeesRisks(): Promise<number> {
        let result: number = 0;
        for (const employeesFraction of this.companyFacts.employeesFractions) {
            const region: IRegion | null = await Region.findOne({countryCode: employeesFraction.countryCode})
            const pppIndex = region !== null ? region.pppIndex : this.defaultPPPIndex;
            result += this.companyFacts.totalStaffCosts * employeesFraction.percentage
                * pppIndex;
        }
        return result;
    }

}